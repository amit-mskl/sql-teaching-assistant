import React, { useState } from 'react';
import './App.css';
import Sidebar from './components/Sidebar';
import ChatInterface from './components/ChatInterface';

function App() {
  const [conversationHistory, setConversationHistory] = useState([]);
  const [sessionTokens, setSessionTokens] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const startNewChat = () => {
    setConversationHistory([]);
    setSessionTokens(0);
  };

  const sendMessage = async (message) => {
    const newHistory = [...conversationHistory, { role: 'user', content: message }];
    setConversationHistory(newHistory);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: newHistory }),
      });

      const data = await response.json();

      if (response.ok) {
        const finalHistory = [...newHistory, { role: 'assistant', content: data.response }];
        setConversationHistory(finalHistory);
        setSessionTokens(prev => prev + data.tokens.total);
      } else {
        const errorHistory = [...newHistory, { role: 'assistant', content: "Sorry, I encountered an error. Please try again." }];
        setConversationHistory(errorHistory);
      }
    } catch (error) {
      const errorHistory = [...newHistory, { role: 'assistant', content: "Sorry, I couldn't connect to the server. Please try again." }];
      setConversationHistory(errorHistory);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app">
      <Sidebar 
        onNewChat={startNewChat}
        sessionTokens={sessionTokens}
        showTokens={sessionTokens > 0}
      />
      <ChatInterface 
        messages={conversationHistory}
        onSendMessage={sendMessage}
        isLoading={isLoading}
      />
    </div>
  );
}

export default App;
