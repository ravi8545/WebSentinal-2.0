import api from './apiClient.js';
import { setStoredToken, clearStoredToken } from '../utils/storage.js';

export const API_ORIGIN =
  import.meta.env.VITE_API_ORIGIN ||
  // When VITE_API_URL points at an absolute URL, derive its origin; otherwise default to backend dev port.
  (import.meta.env.VITE_API_URL && /^https?:\/\//i.test(import.meta.env.VITE_API_URL)
    ? new URL(import.meta.env.VITE_API_URL).origin
    : 'http://localhost:3000');

export const GOOGLE_OAUTH_URL = `${API_ORIGIN}/api/auth/google`;

export async function login({ email, password }) {
  const { data } = await api.post('/auth/login', { email, password });
  if (data.token) setStoredToken(data.token);
  return { ok: true, user: data.user, token: data.token };
}

export async function signup({ name, email, password }) {
  const { data } = await api.post('/auth/register', { name, email, password });
  if (data.token) setStoredToken(data.token);
  return { ok: true, user: data.user, token: data.token };
}

export async function fetchCurrentUser() {
  const { data } = await api.get('/auth/me');
  return data.user;
}

export async function updateProfile(payload) {
  const { data } = await api.put('/auth/profile', payload);
  return data.user;
}

export async function logout() {
  clearStoredToken();
}

export function startGoogleOAuth() {
  if (typeof window !== 'undefined') {
    window.location.href = GOOGLE_OAUTH_URL;
  }
}

export async function requestPasswordReset(email) {
  // Endpoint not implemented in backend yet.
  return { ok: true, email };
}
