import React, { useState, useRef, useEffect } from 'react';
import './ChatInterface.css';
import MessageList from './MessageList';
import ChatInput from './ChatInput';

const ChatInterface = ({ messages, onSendMessage, isLoading }) => {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  return (
    <div className="main-chat">
      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="welcome-message">
            👋 Hi there! I'm Owlstein 🦉, your Learning Assistant.<br />
            For now, I can help you learn about Databases, SQL concepts and coding. Can't wait to begin!
          </div>
        ) : (
          <MessageList messages={messages} />
        )}
        
        {isLoading && (
          <div className="typing-indicator">
            <div className="message assistant">
              <div className="message-avatar">S</div>
              <div className="typing-content">
                <div className="typing-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <span style={{color: '#666', fontSize: '14px'}}>SQL Assistant is thinking...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      <ChatInput onSendMessage={onSendMessage} disabled={isLoading} />
    </div>
  );
};

export default ChatInterface;