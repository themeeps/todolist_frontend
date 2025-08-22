import axios from 'axios';

let onSessionExpired = null;
export const setSessionExpiredHandler = handler => {
  onSessionExpired = handler;
};

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api',
  headers: { Accept: 'application/json' }
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response && err.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (onSessionExpired) onSessionExpired();
    }
    return Promise.reject(err);
  }
);

export default api;
