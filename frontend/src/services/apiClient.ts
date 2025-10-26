// frontend/src/services/apiClient.ts
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the auth token and log requests
api.interceptors.request.use((config) => {
  // BUG FIX: Check both localStorage and sessionStorage for the token
  const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Log all API requests for debugging
  console.log(
    `[API Request] ${config.method?.toUpperCase()} ${config.url}`,
    {
      Authorization: config.headers.Authorization || '(no token)',
    }
  );

  return config;
});

export default api;
