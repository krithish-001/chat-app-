import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

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
  const [token, setToken] = useState(localStorage.getItem('chatToken'));
  const [loading, setLoading] = useState(true);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  // Set axios default headers
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      loadUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  // Load user profile
  const loadUser = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/auth/me`);
      setUser(response.data.data);
    } catch (error) {
      console.error('Load user error:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  // Register new user
  const register = async (name, email, password) => {
    try {
      const response = await axios.post(`${API_URL}/api/auth/register`, {
        name,
        email,
        password,
      });

      const { data } = response.data;
      setToken(data.token);
      setUser(data);
      localStorage.setItem('chatToken', data.token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      
      toast.success('Account created successfully!');
      return true;
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      toast.error(message);
      return false;
    }
  };

  // Login user
  const login = async (email, password) => {
    try {
      const response = await axios.post(`${API_URL}/api/auth/login`, {
        email,
        password,
      });

      const { data } = response.data;
      setToken(data.token);
      setUser(data);
      localStorage.setItem('chatToken', data.token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      
      toast.success('Logged in successfully!');
      return true;
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      return false;
    }
  };

  // Logout user
  const logout = async () => {
    try {
      if (token) {
        await axios.post(`${API_URL}/api/auth/logout`);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('chatToken');
      delete axios.defaults.headers.common['Authorization'];
      toast.success('Logged out successfully!');
    }
  };

  // Update profile
  const updateProfile = async (formData) => {
    try {
      const response = await axios.put(`${API_URL}/api/auth/profile`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setUser(response.data.data);
      toast.success('Profile updated successfully!');
      return true;
    } catch (error) {
      const message = error.response?.data?.message || 'Update failed';
      toast.error(message);
      return false;
    }
  };

  const value = {
    user,
    token,
    loading,
    register,
    login,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
