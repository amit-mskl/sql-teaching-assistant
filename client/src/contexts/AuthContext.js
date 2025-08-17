import React, { createContext, useContext, useState } from 'react';
import { apiFetch } from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('owlstein_token'));
  const [isLoading, setIsLoading] = useState(false);

  // Login function - Now connected to real API!
  const login = async (email, password) => {
    setIsLoading(true);
    try {
      console.log('🔄 Real API login attempt:', email);
      
      const response = await apiFetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Successfully authenticated with backend
        console.log('✅ Real login successful:', data.user.name);
        
        setUser(data.user);
        setToken(data.token);
        localStorage.setItem('owlstein_token', data.token);
        localStorage.setItem('owlstein_user', JSON.stringify(data.user));
        
        return { success: true };
      } else {
        // Login failed - show backend error message
        console.log('❌ Login failed:', data.error);
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error('💥 Login network error:', error);
      return { success: false, error: 'Unable to connect to server. Please try again.' };
    } finally {
      setIsLoading(false);
    }
  };

  // Register function - Create new user account
  const register = async (email, password, firstName, lastName = '') => {
    setIsLoading(true);
    try {
      console.log('🔄 Registration attempt:', email);
      
      const response = await apiFetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, firstName, lastName }),
      });

      const data = await response.json();

      if (response.ok) {
        // Successfully registered with backend
        console.log('✅ Registration successful:', data.user.name);
        
        setUser(data.user);
        setToken(data.token);
        localStorage.setItem('owlstein_token', data.token);
        localStorage.setItem('owlstein_user', JSON.stringify(data.user));
        
        return { success: true };
      } else {
        // Registration failed - show backend error message
        console.log('❌ Registration failed:', data.error);
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error('💥 Registration network error:', error);
      return { success: false, error: 'Unable to connect to server. Please try again.' };
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function - Now calls backend API
  const logout = async () => {
    try {
      console.log('👋 Logging out');
      
      // Call logout API (optional - mainly for logging)
      await apiFetch('/api/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
      });
    } catch (error) {
      console.log('Logout API call failed, but continuing with local logout');
    } finally {
      // Always clear local storage regardless of API call success
      setUser(null);
      setToken(null);
      localStorage.removeItem('owlstein_token');
      localStorage.removeItem('owlstein_user');
    }
  };

  // Set auth data directly (for OAuth callbacks)
  const setAuthData = ({ token: newToken, user: newUser }) => {
    console.log('🔐 Setting auth data from OAuth callback');
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('owlstein_token', newToken);
    localStorage.setItem('owlstein_user', JSON.stringify(newUser));
  };

  // Check if user is logged in
  const isAuthenticated = !!token;

  // Initialize user from localStorage on app start
  React.useEffect(() => {
    const savedUser = localStorage.getItem('owlstein_user');
    const savedToken = localStorage.getItem('owlstein_token');
    
    if (savedUser && savedToken) {
      try {
        setUser(JSON.parse(savedUser));
        setToken(savedToken);
        console.log('🔄 Restored user session from localStorage');
      } catch (error) {
        console.error('Error restoring user session:', error);
        logout();
      }
    }
  }, []);

  const value = {
    user,
    token,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    setAuthData
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};