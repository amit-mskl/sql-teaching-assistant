import express from 'express';
import Anthropic from '@anthropic-ai/sdk';
import path from 'path';

const app = express();
const port = 3000;

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY
});

app.use(express.json());
app.use(express.static('.'));

app.post('/chat', async (req, res) => {
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

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});