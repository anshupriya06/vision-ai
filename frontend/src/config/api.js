import axios from 'axios';
import { auth } from '../firebase';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

if (!import.meta.env.VITE_API_URL && import.meta.env.PROD) {
  // Surface a misconfigured production build instead of silently talking to localhost.
  // eslint-disable-next-line no-console
  console.error('VITE_API_URL is not set; API requests will target localhost and likely fail.');
}

// Default timeout so a hung backend never leaves the UI stuck loading forever.
axios.defaults.timeout = 30000;

// Global request interceptor: attach the Firebase ID token to every request
// aimed at our own backend. Requests to third-party hosts are left untouched.
axios.interceptors.request.use(async (config) => {
  try {
    const url = config.url || '';
    const targetsOurApi = url.startsWith(API_BASE) || url.startsWith('/');
    const user = auth.currentUser;
    if (targetsOurApi && user) {
      const token = await user.getIdToken();
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch {
    // If token retrieval fails, send the request without auth; the backend
    // will respond 401 and the caller can handle it.
  }
  return config;
});

export default API_BASE;
