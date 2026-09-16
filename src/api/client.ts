// src/api/client.ts
import axios from 'axios';
import { useAuthStore } from '../store/auth.store';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
});

client.interceptors.request.use(
  (config) => {
    const { token, user } = useAuthStore.getState();
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Automatically attach backend header authentication requirements
    if (user) {
      if (user.id) config.headers['X-User-Id'] = user.id;
      if (user.role) config.headers['X-User-Role'] = user.role;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);

export default client;