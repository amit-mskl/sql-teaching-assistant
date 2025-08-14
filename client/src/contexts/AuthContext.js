import React, { createContext, useContext, useState } from 'react';

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

  // Login function (will connect to API later)
  const login = async (email, password) => {
    setIsLoading(true);
    try {
      // TODO: Connect to API in Step 3
      console.log('🔄 Login attempt:', email);
      
      // For now, simulate successful login
      if (email === 'demo@owlstein.com' && password === 'password123') {
        const mockUser = { id: 1, name: 'Demo User', email };
        const mockToken = 'mock_jwt_token_for_demo';
        
        setUser(mockUser);
        setToken(mockToken);
        localStorage.setItem('owlstein_token', mockToken);
        localStorage.setItem('owlstein_user', JSON.stringify(mockUser));
        
        console.log('✅ Mock login successful');
        return { success: true };
      } else {
        console.log('❌ Mock login failed');
        return { success: false, error: 'Invalid email or password' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Login failed' };
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    console.log('👋 Logging out');
    setUser(null);
    setToken(null);
    localStorage.removeItem('owlstein_token');
    localStorage.removeItem('owlstein_user');
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
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};