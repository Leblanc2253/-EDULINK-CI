import axios from 'axios';
import { removeAuthToken } from '../utils/auth';

const API = axios.create({
  baseURL: '/api/v1',
});

API.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('edulink_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Don't auto-redirect if we are explicitly on an auth page or performing login/reset
      const isAuthUrl = error.config?.url?.includes('/auth/login') || error.config?.url?.includes('/auth/reset-password') || error.config?.url?.includes('/auth/forgot-password');
      if (!isAuthUrl && typeof window !== 'undefined') {
        const isAuthPage = window.location.pathname === '/login' || window.location.pathname === '/register' || window.location.pathname === '/forgot-password' || window.location.pathname === '/reset-password';
        if (!isAuthPage) {
          removeAuthToken();
          const currentPath = encodeURIComponent(window.location.pathname + window.location.search);
          window.location.href = `/login?return_url=${currentPath}`;
        }
      }
    }
    return Promise.reject(error);
  }
);

export default API;
