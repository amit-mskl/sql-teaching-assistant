import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/Login';
import Signup from './components/Signup';
import ChatApp from './components/ChatApp';
import Discovery from './components/Discovery';
import AuthCallback from './components/AuthCallback';

// Authentication wrapper for protected routes
const AuthenticatedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [showSignup, setShowSignup] = useState(false);

  if (!isAuthenticated) {
    return showSignup ? (
      <Signup onSwitchToLogin={() => setShowSignup(false)} />
    ) : (
      <Login onSwitchToSignup={() => setShowSignup(true)} />
    );
  }

  return children;
};

// Main App content with routing
const AppContent = () => {
  return (
    <Routes>
      {/* GitHub OAuth callback route (no auth required) */}
      <Route path="/auth/callback" element={<AuthCallback />} />
      
      {/* Redirect to platform discovery page */}
      <Route path="/" element={
        <AuthenticatedRoute>
          <Discovery />
        </AuthenticatedRoute>
      } />
      
      {/* Platform routes */}
      <Route path="/platform" element={
        <AuthenticatedRoute>
          <Discovery />
        </AuthenticatedRoute>
      } />
      <Route path="/platform/sql" element={
        <AuthenticatedRoute>
          <ChatApp course="sql" />
        </AuthenticatedRoute>
      } />
      <Route path="/platform/react" element={
        <AuthenticatedRoute>
          <ChatApp course="react" />
        </AuthenticatedRoute>
      } />
      <Route path="/platform/python" element={
        <AuthenticatedRoute>
          <ChatApp course="python" />
        </AuthenticatedRoute>
      } />
    </Routes>
  );
};

// Root App component with AuthProvider and Router
function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
