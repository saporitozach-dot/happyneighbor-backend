import React, { createContext, useState, useEffect, useContext } from 'react';

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
  const AUTH_URL = import.meta.env.VITE_AUTH_URL || 'http://localhost:3001';

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      setError(null);
      const response = await fetch(`${API_URL}/auth/me`, {
        credentials: 'include', // Important for cookies
      });
      
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error('Auth check failed:', err);
      setError('Unable to connect to server. Please make sure the API server is running.');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = (provider = 'linkedin') => {
    // Redirect to OAuth provider
    if (provider === 'google') {
      window.location.href = `${AUTH_URL}/auth/google`;
    } else {
      window.location.href = `${AUTH_URL}/auth/linkedin`;
    }
  };

  const loginWithGoogle = () => {
    window.location.href = `${AUTH_URL}/auth/google`;
  };

  const loginWithLinkedIn = () => {
    window.location.href = `${AUTH_URL}/auth/linkedin`;
  };

  const logout = async () => {
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
      setUser(null);
      window.location.href = '/';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    loginWithGoogle,
    loginWithLinkedIn,
    logout,
    checkAuth,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
