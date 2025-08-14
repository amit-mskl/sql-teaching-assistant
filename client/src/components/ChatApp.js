import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Sidebar from './Sidebar';
import ChatInterface from './ChatInterface';

const ChatApp = ({ course = 'sql' }) => {
  const [conversationHistory, setConversationHistory] = useState([]);
  const [sessionTokens, setSessionTokens] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const { user, token } = useAuth();

  // Fetch course welcome message when course changes
  useEffect(() => {
    const fetchWelcomeMessage = async () => {
      try {
        const response = await fetch(`/api/course/${course}/welcome`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setWelcomeMessage(data.welcome);
          
          // Set initial welcome message if conversation is empty
          if (conversationHistory.length === 0) {
            setConversationHistory([{ role: 'assistant', content: data.welcome }]);
          }
        }
      } catch (error) {
        console.error('Failed to fetch welcome message:', error);
      }
    };

    if (token) {
      fetchWelcomeMessage();
    }
  }, [course, token]);

  const startNewChat = () => {
    setConversationHistory(welcomeMessage ? [{ role: 'assistant', content: welcomeMessage }] : []);
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
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ messages: newHistory, course: course }),
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
        userName={user?.name}
      />
      <ChatInterface 
        messages={conversationHistory}
        onSendMessage={sendMessage}
        isLoading={isLoading}
        course={course}
      />
    </div>
  );
};

export default ChatApp;