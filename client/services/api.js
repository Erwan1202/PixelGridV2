import axios from 'axios';

// Build a robust API base URL that works both in dev and production.
// In development we talk to the local server under /api.
// In production, prefer the environment variable VITE_API_BASE_URL and
// ensure it points to the API origin (it may or may not already include `/api`).
const PROD_ORIGIN = import.meta.env.VITE_API_BASE_URL || '';
const API_BASE_URL =
  import.meta.env.MODE === 'development'
    ? 'http://localhost:3001/api'
    : // if user supplied a base that already ends with /api, keep it; else append /api
      (PROD_ORIGIN.endsWith('/api') ? PROD_ORIGIN : `${PROD_ORIGIN.replace(/\/+$/, '')}/api`);

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
