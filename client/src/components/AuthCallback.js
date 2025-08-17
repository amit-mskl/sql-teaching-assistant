import React, { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const AuthCallback = () => {
  const { setAuthData } = useAuth();

  useEffect(() => {
    // Get token from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const error = urlParams.get('error');

    if (error) {
      console.error('GitHub OAuth error:', error);
      // Redirect to login with error message
      window.location.href = '/login?error=' + encodeURIComponent('GitHub authentication failed');
      return;
    }

    if (token) {
      console.log('✅ GitHub OAuth successful, token received');
      
      // Store token in localStorage (same as regular login)
      localStorage.setItem('authToken', token);
      
      // Decode token to get user info (simple JWT decode)
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        console.log('GitHub user logged in:', payload.name);
        
        // Update auth context
        setAuthData({
          token,
          user: {
            email: payload.email,
            name: payload.name,
            firstName: payload.firstName,
            authProvider: payload.authProvider,
            githubUsername: payload.githubUsername,
            avatarUrl: payload.avatarUrl
          }
        });

        // Redirect to main app
        window.location.href = '/';
        
      } catch (error) {
        console.error('Error decoding token:', error);
        window.location.href = '/login?error=' + encodeURIComponent('Authentication failed');
      }
    } else {
      console.error('No token received from GitHub OAuth');
      window.location.href = '/login?error=' + encodeURIComponent('No authentication token received');
    }
  }, [setAuthData]);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      flexDirection: 'column',
      gap: '16px'
    }}>
      <div style={{ fontSize: '24px' }}>🐙</div>
      <div>Completing GitHub authentication...</div>
    </div>
  );
};

export default AuthCallback;