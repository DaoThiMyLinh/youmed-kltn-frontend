import axios from 'axios';
import { getToken, clearAuth } from '../utils/token';

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
  timeout: 10000,
});

axiosClient.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearAuth();
      // Only redirect if not on a public page
      const publicPaths = ['/login', '/register', '/forgot-password', '/patient', '/patient/doctors', '/patient/specialties'];
      const currentPath = window.location.pathname;
      const isPublicPath = publicPaths.includes(currentPath) || currentPath.startsWith('/patient/doctors/');
      
      if (!isPublicPath) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
