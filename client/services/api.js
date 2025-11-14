import axios from 'axios';

const PROD_ORIGIN =
  import.meta.env.VITE_API_BASE_URL || 'https://pixelgridv2.onrender.com';
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
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);


api.interceptors.response.use(
  (response) => response,
  async (error) => {

    // Si 401, tente de rafraîchir le token
    const originalRequest = error?.config || {};
    if (error?.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        // Tente de rafraîchir le token
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          window.location.href = '/';
          return Promise.reject(error);
        }
        // Appel pour rafraîchir le token
        const rs = await axios.post(`${API_BASE_URL}/auth/refresh-token`, { refreshToken });
        const { accessToken } = rs.data;
        localStorage.setItem('accessToken', accessToken);
        api.defaults.headers.common['Authorization'] = 'Bearer ' + accessToken;
        return api(originalRequest);
      } catch (_error) {
        window.location.href = '/';
        return Promise.reject(_error);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
