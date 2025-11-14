import axios from 'axios';

const API_BASE_URL =
  import.meta.env.MODE === 'development'
    ? 'http://localhost:3001/api' 
    : import.meta.env.VITE_API_BASE_URL; 

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
