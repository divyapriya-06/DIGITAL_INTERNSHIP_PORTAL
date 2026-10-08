import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  // Fetch current user details on load
  const loadUser = async () => {
    const storedToken = localStorage.getItem('token');
    if (!storedToken) {
      setUser(null);
      setProfile(null);
      setLoading(false);
      return;
    }

    try {
      const res = await api.get('/auth/me');
      if (res.data.success) {
        setUser(res.data.user);
        setProfile(res.data.profile);
        setVerificationStatus(res.data.verificationStatus);
      }
    } catch (err) {
      console.error('Session validation failed:', err.message);
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, [token]);

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.success) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        setToken(res.data.token);
        setUser(res.data.user);
        setProfile(res.data.profile);
        setVerificationStatus(res.data.verificationStatus);

        return {
          success: true,
          role: res.data.user.role,
          isProfileComplete: res.data.user.isProfileComplete,
          verificationStatus: res.data.verificationStatus,
        };
      }
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        (!error.response ? 'Unable to reach backend server. Please verify backend is running on port 5000.' : 'Login failed. Please check your credentials.');
      return { success: false, message: msg };
    }
  };

  const register = async (userData) => {
    try {
      const res = await api.post('/auth/register', userData);
      if (res.data.success) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        setToken(res.data.token);
        setUser(res.data.user);
        setProfile(res.data.profile);

        return {
          success: true,
          role: res.data.user.role,
        };
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Registration failed. Please try again.';
      return { success: false, message: msg };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setProfile(null);
    setVerificationStatus(null);
  };

  const refreshProfile = async () => {
    await loadUser();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        verificationStatus,
        token,
        loading,
        login,
        register,
        logout,
        refreshProfile,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
