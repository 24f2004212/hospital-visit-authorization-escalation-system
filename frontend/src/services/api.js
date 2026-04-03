const API_BASE = 'http://localhost:3000/api';

async function fetchAPI(endpoint, options = {}) {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || 'API request failed');
  }
  return response.json();
}

export async function apiLogin(email, password) {
  return fetchAPI('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function apiRegister(userData) {
  return fetchAPI('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  });
}

export async function apiGetRequests() {
  return fetchAPI('/requests');
}

export async function apiSubmitRequest(data) {
  return fetchAPI('/requests', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function apiApproveRequest(id, data) {
  return fetchAPI(`/requests/${id}/approve`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function apiUpdateTrackingStatus(id, status) {
  return fetchAPI(`/requests/${id}/tracking`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export async function apiEscalateRequest(id) {
  return fetchAPI(`/requests/${id}/escalate`, { method: 'PATCH' });
}

export async function apiGetFeedback() {
  return fetchAPI('/feedback');
}

export async function apiSubmitFeedback(data) {
  return fetchAPI('/feedback', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function apiGetGuards() {
  return fetchAPI('/guards');
}

export default {
  apiLogin, apiRegister, apiGetRequests, apiSubmitRequest,
  apiApproveRequest, apiUpdateTrackingStatus, apiEscalateRequest,
  apiGetFeedback, apiSubmitFeedback, apiGetGuards
};
