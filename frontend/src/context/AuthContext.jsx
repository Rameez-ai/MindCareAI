import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, profileAPI } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const response = await profileAPI.getProfile();
      setUser(response.data);
    } catch (error) {
      console.error("Failed to load user profile:", error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await authAPI.login(email, password);
      const { access_token } = response.data;
      localStorage.setItem('token', access_token);
      await fetchProfile();
      return true;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const register = async (email, password, displayName) => {
    setLoading(true);
    try {
      const response = await authAPI.register(email, password, displayName);
      const { access_token } = response.data;
      localStorage.setItem('token', access_token);
      await fetchProfile();
      return true;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setLoading(false);
  };

  const updatePreferences = (updatedUser) => {
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updatePreferences, fetchProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
