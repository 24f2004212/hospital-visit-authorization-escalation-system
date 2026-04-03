/**
 * API Service — Centralized API calls to the Python Flask backend.
 * Currently uses localStorage for demo. Replace with fetch/axios calls
 * when the Flask backend is ready.
 * 
 * Example usage with Flask backend:
 *   const response = await fetch('/api/auth/login', {
 *     method: 'POST',
 *     headers: { 'Content-Type': 'application/json' },
 *     body: JSON.stringify({ email, password })
 *   });
 */

const API_BASE = '/api';

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
