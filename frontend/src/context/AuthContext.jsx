import { createContext, useContext, useState, useEffect } from 'react';
import { apiLogin, apiRegister } from '../services/api';

const AuthContext = createContext(null);
const SESSION_KEY = 'medguard_session';

function getSession() {
  try {
    const session = localStorage.getItem(SESSION_KEY);
    return session ? JSON.parse(session) : null;
  } catch {
    return null;
  }
}

function saveSession(user) {
  if (user) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(SESSION_KEY);
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    const session = getSession();
    if (session) {
      setUser(session);
    }
    setLoading(false);
  }, []);

  const register = async (userData) => {
    const newUser = await apiRegister(userData);
    setUser(newUser);
    saveSession(newUser);
    return newUser;
  };

  const login = async (email, password) => {
    const loggedInUser = await apiLogin(email, password);
    setUser(loggedInUser);
    saveSession(loggedInUser);
    return loggedInUser;
  };

  const logout = () => {
    setUser(null);
    saveSession(null);
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
