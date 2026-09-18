import axios from 'axios';

// Public axios client - no auth token, no 401 redirect
// Used for public-facing pages (Home, Doctor list, Specialty list) that guests can access
const axiosPublic = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
  timeout: 10000,
});

export default axiosPublic;
