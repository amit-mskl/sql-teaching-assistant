import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import './UserHeader.css';

const UserHeader = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const isOnPlatformPage = location.pathname === '/platform';
  
  const goBackToPlatform = () => {
    navigate('/platform');
  };
  
  return (
    <div className="user-header">
      <div className="header-content">
        {!isOnPlatformPage && (
          <button className="back-btn" onClick={goBackToPlatform}>
            ← Back to Home
          </button>
        )}
        <div className="user-controls">
          <span className="welcome-text">
            Welcome, {user?.name || user?.firstName || 'Learner'}!
            {user?.authProvider === 'github' && (
              <span className="github-badge" title={`Logged in via GitHub (@${user.githubUsername})`}>
                🐙
              </span>
            )}
          </span>
          <button className="logout-btn" onClick={logout}>
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserHeader;