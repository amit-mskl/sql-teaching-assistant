import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './Login.css';

const Login = () => {
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

  const fillDemoCredentials = () => {
    setEmail('demo@owlstein.com');
    setPassword('password123');
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">🦉</div>
          <h1>Welcome to Owlstein</h1>
          <p>Your SQL AI Buddy</p>
        </div>

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

        <div className="login-demo">
          <p>Try the demo:</p>
          <button 
            type="button" 
            onClick={fillDemoCredentials}
            className="demo-button"
            disabled={isLoading}
          >
            Use Demo Account
          </button>
        </div>

        <div className="login-footer">
          <p>Phase A: Hardcoded Users Demo</p>
          <p>Email: demo@owlstein.com | Password: password123</p>
        </div>
      </div>
    </div>
  );
};

export default Login;