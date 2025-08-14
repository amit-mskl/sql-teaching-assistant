import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Discovery.css';

const Discovery = () => {
  const navigate = useNavigate();
  
  const startSQLCourse = () => {
    navigate('/platform/sql');
  };
  
  const startReactCourse = () => {
    navigate('/platform/react');
  };
  
  const startPythonCourse = () => {
    navigate('/platform/python');
  };
  
  return (
    <div className="discovery-container">
      {/* Header Section */}
      <div className="discovery-header">
        <h2>Crafted by industry experts</h2>
        <p>AI-powered personalized learning experiences</p>
      </div>
      
      {/* Search Bar */}
      <input 
        type="text" 
        className="discovery-search" 
        placeholder="Search learning experiences..." 
      />
      
      {/* Tabs */}
      <div className="discovery-tabs">
        <div className="tab active">Explore</div>
        <div className="tab">Your Paths</div>
      </div>
      
      {/* Courses Grid */}
      <div className="courses-grid">
        {/* Tony Stark SQL Mentor Card */}
        <div className="learning-card tony-stark" onClick={startSQLCourse}>
          <div className="card-header">
            <div className="avatar-section">
              <div className="avatar-icon">🤖</div>
              <div className="avatar-name">Tony Stark</div>
            </div>
            <div className="card-badge badge-genius">⚡ Genius</div>
          </div>
          <div className="card-title">Database Architecture & SQL Mastery</div>
          <div className="card-subtitle">Learn from the genius billionaire engineer</div>
          <div className="card-meta">
            <span>🛠️ Workshop Style</span>
            <span>⏱️ 3-4 hours</span>
          </div>
          <div className="card-expertise">Advanced SQL • Database Optimization • Data Architecture</div>
        </div>
        
        {/* React Course Card */}
        <div className="learning-card react" onClick={startReactCourse}>
          <div className="card-header">
            <div className="card-icons">
              <div className="icon">⚛️</div>
              <div className="icon">🟢</div>
            </div>
            <div className="card-badge badge-ai">🤖 AI-Guided</div>
          </div>
          <div className="card-title">E-commerce App with React & Node</div>
          <div className="card-meta">
            <span>📚 8 Modules</span>
            <span>⏱️ 6-8 hours</span>
          </div>
        </div>
        
        {/* Python Course Card */}
        <div className="learning-card python" onClick={startPythonCourse}>
          <div className="card-header">
            <div className="card-icons">
              <div className="icon">🐍</div>
              <div className="icon">🧠</div>
            </div>
            <div className="card-badge badge-free">Free</div>
          </div>
          <div className="card-title">Data Science Foundation</div>
          <div className="card-meta">
            <span>📚 12 Modules</span>
            <span>⏱️ 15-20 hours</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Discovery;