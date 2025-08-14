import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import './Sidebar.css';

const Sidebar = ({ onNewChat, sessionTokens, showTokens, userName, course = 'sql' }) => {
  const { logout } = useAuth();
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

  const getCourseBranding = (courseId) => {
    switch(courseId) {
      case 'sql':
        return {
          name: 'Tony Stark',
          title: 'Genius Database Architect',
          avatar: '🤖'
        };
      default:
        return {
          name: 'Owlstein',
          title: 'Your AI Learning Buddy',
          avatar: '🦉'
        };
    }
  };

  const branding = getCourseBranding(course);

  return (
    <div className="sidebar">
      <h1>{branding.avatar} {branding.name}</h1>
      <p>{branding.title}</p>
      
      <div className="user-info">
        <div className="user-welcome">Welcome, {userName}!</div>
        <button className="logout-btn" onClick={logout}>
          Sign Out
        </button>
      </div>
      
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