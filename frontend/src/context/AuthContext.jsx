import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

// Simulated user database (in production, this will be replaced by API calls to Flask backend)
const STORAGE_KEY = 'medguard_users';
const SESSION_KEY = 'medguard_session';

function getStoredUsers() {
  try {
    const users = localStorage.getItem(STORAGE_KEY);
    return users ? JSON.parse(users) : [];
  } catch {
    return [];
  }
}

function saveUsers(users) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

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

  // Register a new user
  const register = async ({ fullName, email, password, role, hostelBlock, roomNumber, contactNumber }) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const users = getStoredUsers();

    // Check if user already exists
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error('An account with this email already exists');
    }

    const newUser = {
      id: Date.now().toString(),
      fullName,
      email: email.toLowerCase(),
      password, // In production, this would be hashed on the backend
      role,
      hostelBlock: hostelBlock || '',
      roomNumber: roomNumber || '',
      contactNumber: contactNumber || '',
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    saveUsers(users);

    // Auto-login after registration
    const sessionUser = { ...newUser };
    delete sessionUser.password;
    setUser(sessionUser);
    saveSession(sessionUser);

    return sessionUser;
  };

  // Login
  const login = async (email, password) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 600));

    const users = getStoredUsers();
    const found = users.find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );

    if (!found) {
      throw new Error('Invalid email or password');
    }

    const sessionUser = { ...found };
    delete sessionUser.password;
    setUser(sessionUser);
    saveSession(sessionUser);

    return sessionUser;
  };

  // Logout
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
