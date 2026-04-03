'use client';
import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

// Demo users
const DEMO_USERS = [
  { id: 'STU001', email: 'rahul@hostel.edu', password: 'password', fullName: 'Rahul Sharma', role: 'student', hostelBlock: 'Block A', roomNumber: '204', contactNumber: '+91 98765 43210' },
  { id: 'STU002', email: 'priya@hostel.edu', password: 'password', fullName: 'Priya Patel', role: 'student', hostelBlock: 'Block B', roomNumber: '112', contactNumber: '+91 87654 32109' },
  { id: 'STU003', email: 'amit@hostel.edu', password: 'password', fullName: 'Amit Kumar', role: 'student', hostelBlock: 'Block A', roomNumber: '307', contactNumber: '+91 76543 21098' },
  { id: 'ADM001', email: 'warden@hostel.edu', password: 'password', fullName: 'Dr. Meera Reddy', role: 'warden', hostelBlock: '', roomNumber: '', contactNumber: '+91 99887 76655' },
  { id: 'ADM002', email: 'proctor@hostel.edu', password: 'password', fullName: 'Prof. Suresh Iyer', role: 'proctor', hostelBlock: '', roomNumber: '', contactNumber: '+91 99776 65544' },
  { id: 'ADM003', email: 'admin@hostel.edu', password: 'password', fullName: 'Admin User', role: 'admin', hostelBlock: '', roomNumber: '', contactNumber: '+91 99665 54433' },
  { id: 'GRD001', email: 'guard@hostel.edu', password: 'password', fullName: 'Rajesh Singh', role: 'guard', hostelBlock: '', roomNumber: '', contactNumber: '+91 88776 65544' },
];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState(DEMO_USERS);

  useEffect(() => {
    const stored = localStorage.getItem('caresync_user');
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch { /* ignore */ }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const found = users.find(u => u.email === email && u.password === password);
    if (!found) throw new Error('Invalid email or password');
    const userData = { ...found };
    delete userData.password;
    setUser(userData);
    localStorage.setItem('caresync_user', JSON.stringify(userData));
    return userData;
  };

  const register = async (data) => {
    if (users.find(u => u.email === data.email)) {
      throw new Error('Email already registered');
    }
    const newUser = {
      id: `USR${String(users.length + 1).padStart(3, '0')}`,
      ...data,
    };
    setUsers(prev => [...prev, newUser]);
    const userData = { ...newUser };
    delete userData.password;
    setUser(userData);
    localStorage.setItem('caresync_user', JSON.stringify(userData));
    return userData;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('caresync_user');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
