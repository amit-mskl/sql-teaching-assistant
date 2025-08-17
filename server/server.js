import express from 'express';
import Anthropic from '@anthropic-ai/sdk';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import passport from 'passport';
import { Strategy as GitHubStrategy } from 'passport-github2';
import session from 'express-session';
import { authService, requireAuth } from './auth.js';
import { initDatabase, userDb, chatDb } from './database.js';
import { generateOwlsteinPrompt, getCourseWelcome } from './courseContexts.js';
import { executeSQL, getDatabaseSchema } from './sqlExecutor.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 5000;

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY
});

app.use(express.json());

// Session configuration for Passport
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production' } // Enable secure cookies in production
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Passport session serialization
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await userDb.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// GitHub OAuth Strategy
passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: process.env.GITHUB_CALLBACK_URL || "http://localhost:5000/auth/github/callback"
}, async (accessToken, refreshToken, profile, done) => {
  try {
    console.log('🐙 GitHub OAuth callback received');
    console.log('📋 GitHub profile:', { 
      id: profile.id, 
      username: profile.username, 
      displayName: profile.displayName,
      email: profile.emails?.[0]?.value 
    });

    // Check if user already exists
    let user = await userDb.findByGithubId(profile.id);
    
    if (user) {
      console.log('✅ Existing GitHub user found');
      await userDb.updateLastLogin(user.id);
      return done(null, user);
    }

    // Create new GitHub user
    console.log('👤 Creating new GitHub user');
    user = await userDb.createGithubUser(profile);
    await userDb.updateLastLogin(user.id);
    
    return done(null, user);
  } catch (error) {
    console.error('❌ GitHub OAuth error:', error);
    return done(error, null);
  }
}));

// Serve static files from the React build directory
app.use(express.static(path.join(__dirname, '../client/build')));

// Authentication API routes
app.post('/api/login', async (req, res) => {
    console.log('\n📧 Login attempt:', req.body.email);
    
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            console.log('❌ Missing email or password');
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Find user in database
        const user = await authService.findUserByEmail(email);
        if (!user) {
            console.log('❌ User not found in database');
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Verify password
        const isValidPassword = await authService.verifyPassword(password, user.password_hash);
        if (!isValidPassword) {
            console.log('❌ Invalid password');
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Update last login timestamp
        await userDb.updateLastLogin(user.id);

        // Generate JWT token
        const token = authService.generateToken(user);
        
        console.log('✅ Login successful');
        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                name: user.display_name,
                email: user.email
            }
        });

    } catch (error) {
        console.error('💥 Login error:', error);
        res.status(500).json({ error: 'Server error during login' });
    }
});

// Get current user info (protected route)
app.get('/api/me', requireAuth, (req, res) => {
    console.log('👤 Getting user info for:', req.user.email);
    res.json({
        user: {
            id: req.user.userId,
            name: req.user.name,
            email: req.user.email
        }
    });
});

// User registration
app.post('/api/register', async (req, res) => {
    console.log('\n📝 Registration attempt:', req.body.email);
    
    try {
        const { email, password, firstName, lastName } = req.body;

        // Validate input
        if (!email || !password || !firstName) {
            console.log('❌ Missing required fields');
            return res.status(400).json({ error: 'Email, password, and first name are required' });
        }

        // Check if user already exists
        const existingUser = await authService.findUserByEmail(email);
        if (existingUser) {
            console.log('❌ User already exists');
            return res.status(409).json({ error: 'User already exists with this email' });
        }

        // Create new user
        const newUser = await authService.createUser(email, password, firstName, lastName);
        
        // Generate JWT token
        const token = authService.generateToken(newUser);
        
        console.log('✅ Registration successful');
        res.status(201).json({
            message: 'Registration successful',
            token,
            user: {
                id: newUser.id,
                name: newUser.display_name,
                email: newUser.email
            }
        });

    } catch (error) {
        console.error('💥 Registration error:', error);
        if (error.message === 'EMAIL_EXISTS') {
            res.status(409).json({ error: 'User already exists with this email' });
        } else {
            res.status(500).json({ error: 'Server error during registration' });
        }
    }
});

// Logout (client-side token removal, but we can log it)
app.post('/api/logout', (req, res) => {
    console.log('👋 User logged out');
    res.json({ message: 'Logged out successfully' });
});

// GitHub OAuth Routes
app.get('/auth/github', passport.authenticate('github', { scope: ['user:email'] }));

app.get('/auth/github/callback', 
  passport.authenticate('github', { failureRedirect: '/login?error=github_auth_failed' }),
  async (req, res) => {
    try {
      console.log('✅ GitHub OAuth successful');
      
      // Generate JWT token for the user
      const token = authService.generateToken(req.user);
      
      // Update last login
      await userDb.updateLastLogin(req.user.id);
      
      // Redirect to frontend with token
      // In development, redirect to React app with token in URL params
      res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/auth/callback?token=${token}`);
      
    } catch (error) {
      console.error('❌ Error in GitHub callback:', error);
      res.redirect('/login?error=auth_callback_failed');
    }
  }
);

// Get course welcome message
app.get('/api/course/:courseId/welcome', requireAuth, (req, res) => {
    const courseId = req.params.courseId;
    const welcomeMessage = getCourseWelcome(courseId);
    
    console.log(`🎓 Course welcome requested: ${courseId} for user ${req.user.email}`);
    
    res.json({ 
        course: courseId,
        welcome: welcomeMessage 
    });
});

// Tony Stark's Workshop: Execute SQL queries
app.post('/api/execute-sql', requireAuth, async (req, res) => {
    const { query, course } = req.body;
    const userId = req.user.userId;
    
    // Only allow SQL execution in Tony Stark's course
    if (course !== 'sql') {
        return res.status(403).json({ 
            error: 'SQL execution is only available in Tony Stark\'s workshop' 
        });
    }
    
    console.log(`🤖 Tony's Workshop: SQL execution for user ${req.user.email}`);
    console.log(`Query: ${query}`);
    
    const result = await executeSQL(query);
    
    res.json({
        success: result.success,
        results: result.results,
        error: result.error,
        executionTime: result.executionTime,
        rowCount: result.rowCount,
        workshop: 'Tony Stark\'s SQL Workshop'
    });
});

// Get database schema for Tony's workshop
app.get('/api/database-schema', requireAuth, async (req, res) => {
    console.log(`🔧 Database schema requested by ${req.user.email}`);
    
    const schema = await getDatabaseSchema();
    
    res.json({
        schema: schema,
        workshop: 'Tony Stark\'s SQL Workshop',
        message: 'FRIDAY: Database schema loaded. Ready for query optimization.'
    });
});

// Chat API route (now protected - requires login with database logging)
app.post('/api/chat', requireAuth, async (req, res) => {
    try {
        const { messages, course } = req.body;
        const userId = req.user.userId;
        const courseId = course || 'sql'; // Default to SQL if no course specified
        
        console.log(`\n💬 Chat request from user ${userId} (${req.user.email}) - Course: ${courseId}`);
        
        // Get or create current chat session
        const session = await chatDb.getOrCreateCurrentSession(userId);
        console.log(`📝 Using session: ${session.id}`);
        
        // Get the user's message (last message in the array)
        const userMessage = messages[messages.length - 1];
        if (userMessage && userMessage.role === 'user') {
            // Save user message to database
            await chatDb.saveMessage(session.id, 'user', userMessage.content);
        }
        
        // Generate course-specific system prompt for Universal Owlstein
        const systemPrompt = generateOwlsteinPrompt(courseId);
        
        // Call Anthropic API with Universal Owlstein
        const message = await anthropic.messages.create({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 500,
            system: systemPrompt,
            messages: messages
        });

        // Extract token usage
        const usage = message.usage;
        const assistantResponse = message.content[0].text;
        
        // Save assistant response to database
        await chatDb.saveMessage(session.id, 'assistant', assistantResponse, usage.output_tokens);
        
        // Update session timestamp
        await chatDb.updateSessionTimestamp(session.id);
        
        console.log(`✅ Chat completed - Session: ${session.id}, Tokens: ${usage.total}`);
        
        res.json({ 
            response: assistantResponse,
            tokens: {
                input: usage.input_tokens,
                output: usage.output_tokens,
                total: usage.input_tokens + usage.output_tokens
            },
            session_id: session.id
        });
    } catch (error) {
        console.error('💥 Chat error:', error);
        res.status(500).json({ error: 'Failed to get response' });
    }
});

// Serve React app for all other routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});

// Initialize database and start server
async function startServer() {
    try {
        console.log('🚀 Initializing database...');
        await initDatabase();
        console.log('✅ Database initialized');

        app.listen(port, () => {
            console.log(`Server running at http://localhost:${port}`);
            console.log('🦉 Owlstein, the SQL AI Buddy is ready!');
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}

startServer();