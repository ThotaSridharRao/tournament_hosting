import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

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
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // API base URL
  const API_BASE_URL = process.env.NODE_ENV === 'production' 
    ? 'https://t2-237c.onrender.com' 
    : 'https://t2-237c.onrender.com';

  // Configure axios defaults
  useEffect(() => {
    axios.defaults.baseURL = API_BASE_URL;
    
    // Add token to all requests if available
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token, API_BASE_URL]);

  // Check for existing session on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('auth_token');
    const savedUser = localStorage.getItem('user_data');
    
    if (savedToken && savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setToken(savedToken);
        setUser(userData);
      } catch (error) {
        console.error('Error parsing saved user data:', error);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
      }
    }
    
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axios.post('/api/auth/login', {
        email,
        password
      });

      if (response.data.success) {
        const { token: authToken, user: userData } = response.data.data;
        
        setToken(authToken);
        setUser(userData);
        
        // Save to localStorage
        localStorage.setItem('auth_token', authToken);
        localStorage.setItem('user_data', JSON.stringify(userData));
        
        return { success: true, user: userData };
      } else {
        throw new Error(response.data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      const message = error.response?.data?.detail || error.message || 'Login failed';
      return { success: false, error: message };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    delete axios.defaults.headers.common['Authorization'];
  };

  const isAdmin = () => {
    return user?.role === 'admin';
  };

  const isHost = () => {
    return user?.role === 'host';
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    isAdmin,
    isHost,
    API_BASE_URL
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};