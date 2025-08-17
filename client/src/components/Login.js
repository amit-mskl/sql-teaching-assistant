import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './Login.css';

const Login = ({ onSwitchToSignup }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, isLoading } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    const result = await login(email, password);
    if (!result.success) {
      setError(result.error);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">🦉</div>
          <h1>Welcome to Owlstein</h1>
          <p>Your SQL AI Buddy</p>
        </div>

        {/* GitHub Authentication Section - Now Primary */}
        <div className="github-auth-section">
          <button 
            type="button"
            onClick={() => window.location.href = 'http://localhost:5000/auth/github'}
            className="github-login-button"
            disabled={isLoading}
          >
            <span className="github-icon">🐙</span>
            Assemble with GitHub
          </button>

          <div className="github-signup-section">
            <p className="github-signup-text">New to GitHub?</p>
            <button 
              type="button"
              onClick={() => window.open('https://github.com/join', '_blank')}
              className="github-signup-button"
              disabled={isLoading}
            >
              <span className="github-icon">🐙</span>
              Create GitHub Account
            </button>
          </div>
        </div>

        <div className="login-divider">
          <span>or</span>
        </div>

        {/* Email/Password Section - Now Secondary */}
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              disabled={isLoading}
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button 
            type="submit" 
            className="login-button"
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="login-footer">
          <p>
            Don't have an account?{' '}
            <button 
              type="button" 
              onClick={onSwitchToSignup}
              className="link-button"
              disabled={isLoading}
            >
              Sign Up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;