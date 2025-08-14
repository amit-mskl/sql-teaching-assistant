import React from 'react';
import './Discovery.css';

const Discovery = () => {
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
        {/* SQL Course Card */}
        <div className="learning-card sql">
          <div className="card-header">
            <div className="card-icons">
              <div className="icon">SQL</div>
              <div className="icon">📊</div>
            </div>
            <div className="card-badge badge-ai">🤖 AI-Guided</div>
          </div>
          <div className="card-title">Data Analysis using SQL</div>
          <div className="card-meta">
            <span>📚 5 Modules</span>
            <span>⏱️ 3-4 hours</span>
          </div>
        </div>
        
        {/* Placeholder for other courses */}
        <div className="learning-card react" style={{opacity: 0.5}}>
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
        
        <div className="learning-card python" style={{opacity: 0.5}}>
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