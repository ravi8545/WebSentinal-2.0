import axios from 'axios';

import { clearStoredToken, clearStoredUser, getStoredToken } from '../utils/storage.js';

const baseURL =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  '/api';

const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error?.response?.status === 401) {
      clearStoredToken();
      clearStoredUser();
      // Let the auth context detect logged-out state via storage; reload to landing.
      if (typeof window !== 'undefined' && window.location.pathname !== '/') {
        window.location.href = '/';
      }
    }
    const message =
      error?.response?.data?.message || error?.message || 'Request failed';
    return Promise.reject(new Error(message));
  },
);

export default api;
