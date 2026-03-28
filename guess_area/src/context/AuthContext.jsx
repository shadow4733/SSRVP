import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const savedToken = localStorage.getItem('token');
      if (savedToken) {
        try {
          const userData = await authAPI.getCurrentUser(savedToken);
          setUser(userData);
          setToken(savedToken);
        } catch (error) {
          console.error('Auth check failed:', error);
          localStorage.removeItem('token');
          setToken(null);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (username, password) => {
    const response = await authAPI.login(username, password);
    const { access_token } = response;
    
    localStorage.setItem('token', access_token);
    setToken(access_token);
    
    const userData = await authAPI.getCurrentUser(access_token);
    setUser(userData);
    
    return userData;
  };

  const register = async (username, email, password) => {
    const response = await authAPI.register(username, email, password);
    const { access_token } = response;
    
    localStorage.setItem('token', access_token);
    setToken(access_token);
    
    const userData = await authAPI.getCurrentUser(access_token);
    setUser(userData);
    
    return userData;
  };

  const logout = () => {
    authAPI.logout();
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
