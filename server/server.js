import express from 'express';
import Anthropic from '@anthropic-ai/sdk';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { authService, requireAuth } from './auth.js';

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

        // Find user
        const user = authService.findUserByEmail(email);
        if (!user) {
            console.log('❌ User not found');
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Verify password
        const isValidPassword = await authService.verifyPassword(password, user.password);
        if (!isValidPassword) {
            console.log('❌ Invalid password');
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Generate JWT token
        const token = authService.generateToken(user);
        
        console.log('✅ Login successful');
        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                name: user.name,
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

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});