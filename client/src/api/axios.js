import axios from 'axios';
import { getApiBaseUrl } from '../config/apiBase';

const api = axios.create({
  baseURL: getApiBaseUrl(),
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ss_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('ss_token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;