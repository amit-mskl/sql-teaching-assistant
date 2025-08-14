import React from 'react';
import './App.css';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/Login';
import ChatApp from './components/ChatApp';

// Main App component that handles authentication routing
const AppContent = () => {
  const { isAuthenticated } = useAuth();

  // Show login if not authenticated, otherwise show the main chat app
  return isAuthenticated ? <ChatApp /> : <Login />;
};

// Root App component with AuthProvider
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
