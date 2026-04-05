import axios from 'axios';

// ✅ FIX: Vite proxy ki wajah se sirf /api use karo (no full URL)
const api = axios.create({
  baseURL: '/api',   // Proxy handle karega localhost:5000 forward
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ss_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const msg = err.response?.data?.message || err.message;
    console.error(`API Error [${err.response?.status}]:`, msg);
    if (err.response?.status === 401) {
      localStorage.removeItem('ss_token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;