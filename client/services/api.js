import axios from 'axios';

const PROD_ORIGIN = import.meta.env.VITE_API_BASE_URL || '';
const API_BASE_URL =
  import.meta.env.MODE === 'development'
    ? 'http://localhost:3001/api'
    : (PROD_ORIGIN.endsWith('/api') ? PROD_ORIGIN : `${PROD_ORIGIN.replace(/\/+$/, '')}/api`);

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    try {
      const hasToken = !!token;
      console.debug('[api] Interceptor - accessToken present:', hasToken);
    } catch (e) {}

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
