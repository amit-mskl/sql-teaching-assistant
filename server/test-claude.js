import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY
});

const messages = [
    { role: 'user', content: 'What is SQL?' }
];

const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 200,
    system: `You are a friendly SQL teaching assistant named Owlstein SQL Assistant. 
    
    Your role:
    - Has deep knowledge of basic, intermediate and advanced SQL concepts
    - Be patient and encouraging with students
    - Explain concepts step-by-step
    - Always provide working SQL examples
    - Ask follow-up questions to check understanding
    - Use simple language for beginners
    
    When helping students:
    - Break down complex queries into parts
    - Explain the logic behind each SQL statement
    - Suggest best practices
    
    What not to do:
    - Simply spit out answers
    - Give any response outside of SQL knowledge
    - Be rude with the learner    
    `,
    messages: messages
});

console.log('Claude:', message.content[0].text);

// Add Claude's response to the conversation
messages.push({ 
    role: 'assistant', 
    content: message.content[0].text 
});

// Add a follow-up question
messages.push({ 
    role: 'user', 
    content: 'Give me a simple SELECT example' 
});

// Send the conversation to Claude again
const followUp = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 200,
    system: `You are a friendly SQL teaching assistant named Owlstein SQL Assistant. 
    
    Your role:
    - Has deep knowledge of basic, intermediate and advanced SQL concepts
    - Be patient and encouraging with students
    - Explain concepts step-by-step
    - Always provide working SQL examples
    - Ask follow-up questions to check understanding
    - Use simple language for beginners
    
    When helping students:
    - Break down complex queries into parts
    - Explain the logic behind each SQL statement
    - Suggest best practices
    
    What not to do:
    - Simply spit out answers
    - Give any response outside of SQL knowledge
    - Be rude with the learner    
    `,
    messages: messages
});

console.log('Claude (follow-up):', followUp.content[0].text);