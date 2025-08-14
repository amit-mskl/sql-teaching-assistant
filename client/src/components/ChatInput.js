import React, { useState } from 'react';

const ChatInput = ({ onSendMessage, disabled }) => {
  const [message, setMessage] = useState('');

  const handleSubmit = () => {
    if (!message.trim() || disabled) return;
    
    onSendMessage(message.trim());
    setMessage('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleInputChange = (e) => {
    setMessage(e.target.value);
    // Auto-resize textarea
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
  };

  return (
    <div className="chat-input-container">
      <div className="chat-input-wrapper">
        <textarea 
          value={message}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          className="chat-input" 
          placeholder="Ask me about SQL, databases, queries..."
          rows="1"
          disabled={disabled}
        />
        <button 
          onClick={handleSubmit}
          disabled={disabled || !message.trim()}
          className="send-button"
        >
          ↗
        </button>
      </div>
    </div>
  );
};

export default ChatInput;