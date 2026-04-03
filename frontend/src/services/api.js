// Legacy fetch-based API helper kept aligned with the Nest backend config.
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export async function apiLogin(email, password) {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message || 'Login failed');
  }
  return response.json();
}

export async function apiRegister(userData) {
  const response = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message || 'Registration failed');
  }
  return response.json();
}

export default { apiLogin, apiRegister };
