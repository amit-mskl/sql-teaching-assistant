import express from 'express';
import Anthropic from '@anthropic-ai/sdk';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { authService, requireAuth } from './auth.js';
import { initDatabase, userDb } from './database.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 5000;

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY
});

app.use(express.json());

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

// Chat API route (now protected - requires login)
app.post('/api/chat', requireAuth, async (req, res) => {
    try {
        const { messages } = req.body;
        
        const message = await anthropic.messages.create({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 500,
            system: `You are a friendly SQL teaching assistant named Owlstein SQL Assistant.     
            Your role:
            - Be patient and encouraging with students
            - Explain concepts step-by-step
            - Always provide working SQL examples
            - Ask follow-up questions to check understanding
            - Use simple language for beginners
            
            When helping students:
            - Do not spit out answers easily. Give chance or clues to think better
            - Break down complex queries into parts
            - Explain the logic behind each SQL statement
            - Suggest best practices`,
            messages: messages
        });

        // Extract token usage
        const usage = message.usage;
        
        res.json({ 
            response: message.content[0].text,
            tokens: {
                input: usage.input_tokens,
                output: usage.output_tokens,
                total: usage.input_tokens + usage.output_tokens
            }
        });
    } catch (error) {
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