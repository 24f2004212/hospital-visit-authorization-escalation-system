'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import api from '@/utils/api';

const AuthContext = createContext(null);

const SESSION_KEY = 'caresync_user';
const TOKEN_KEY = 'caresync_token';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    const stored = localStorage.getItem(SESSION_KEY);
    const token = localStorage.getItem(TOKEN_KEY);
    if (stored && token) {
      try {
        setUser(JSON.parse(stored));
      } catch { /* ignore */ }
    }
    setLoading(false);
  }, []);

  // Register a new user via backend API
  const register = async ({ fullName, email, password, role, hostelBlock, roomNumber, contactNumber, proctorEmail, parentEmail, parentPhone }) => {
    try {
      const res = await api.post('/auth/register', {
        fullName,
        email: email.toLowerCase(),
        password,
        role,
        hostelBlock: hostelBlock || '',
        roomNumber: roomNumber || '',
        contactNumber: contactNumber || '',
        proctorEmail: proctorEmail || '',
        parentEmail: parentEmail || '',
        parentPhone: parentPhone || '',
      });

      const data = res.data;

      // If staff registration is pending approval, don't log in
      if (data.pendingApproval) {
        return { pendingApproval: true, message: data.message };
      }

      const { access_token, user: userData } = data;
      localStorage.setItem(TOKEN_KEY, access_token);
      localStorage.setItem(SESSION_KEY, JSON.stringify(userData));
      setUser(userData);
      return userData;
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Registration failed';
      throw new Error(message);
    }
  };

  // Login via backend API
  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', {
        email: email.toLowerCase(),
        password,
      });

      const { access_token, user: userData } = res.data;
      localStorage.setItem(TOKEN_KEY, access_token);
      localStorage.setItem(SESSION_KEY, JSON.stringify(userData));
      setUser(userData);
      return userData;
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Invalid email or password';
      throw new Error(message);
    }
  };

  // Logout
  const logout = () => {
    setUser(null);
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(TOKEN_KEY);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
