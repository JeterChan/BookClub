import { apiClient } from './api';
import type { RegisterRequest, LoginRequest, TokenResponse } from '../types/auth';

export const authService = {
  register: async (data: RegisterRequest): Promise<TokenResponse> => {
    const response = await apiClient.post('/api/auth/register', data);
    return response.data;
  },
  
  login: async (data: LoginRequest): Promise<TokenResponse> => {
    const response = await apiClient.post('/api/auth/login', data);
    return response.data;
  },
  
  checkEmail: async (email: string): Promise<{ available: boolean; message?: string }> => {
    const response = await apiClient.get('/api/auth/check-email', {
      params: { email }
    });
    return response.data;
  },
  
  googleLogin: async (credential: string): Promise<TokenResponse> => {
    const response = await apiClient.post('/api/auth/google', { credential });
    return response.data;
  }
};
