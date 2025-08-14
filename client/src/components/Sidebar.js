import React from 'react';
import './Sidebar.css';

const Sidebar = ({ onNewChat, sessionTokens, showTokens }) => {
  const formatTokens = (tokens) => {
    return tokens.toLocaleString();
  };

  const calculateCost = (tokens) => {
    const PRICING = {
      input: 0.003,    // $3 per 1M tokens
      output: 0.015    // $15 per 1M tokens  
    };
    const avgCost = (PRICING.input + PRICING.output) / 2;
    return ((tokens / 1000) * avgCost).toFixed(4);
  };

  return (
    <div className="sidebar">
      <h1>🦉 Owlstein - The Learning Assistant</h1>
      <p>Your friendly guide to mastering SQL</p>
      
      <button className="new-chat-btn" onClick={onNewChat}>
        + New Chat
      </button>
      
      <div className="chat-history">
        <h3>Recent</h3>
      </div>
      
      {showTokens && (
        <div className="token-display">
          <div><strong>Session Stats</strong></div>
          <div style={{marginTop: '8px', fontSize: '11px'}}>
            <div>Tokens: <span>{formatTokens(sessionTokens)}</span></div>
            <div>Cost: <span>${calculateCost(sessionTokens)}</span></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;