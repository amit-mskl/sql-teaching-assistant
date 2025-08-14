import React, { useState } from 'react';

const ChatInput = ({ onSendMessage, disabled, course = 'sql' }) => {
  const [message, setMessage] = useState('');
  
  const getCoursePlaceholder = (courseId) => {
    const courseNames = {
      sql: 'Data Analysis using SQL',
      react: 'E-commerce App with React & Node',
      python: 'Data Science Foundation',
      excel: 'Excel Essentials'
    };
    const courseName = courseNames[courseId] || courseId;
    return `Ask me anything about the course - ${courseName}`;
  };

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
          placeholder={getCoursePlaceholder(course)}
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