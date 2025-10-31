import { apiClient } from './api';
import type { RegisterRequest, LoginRequest, TokenResponse, RegistrationResponse, EmailVerificationResponse } from '../types/auth';

export const authService = {
  register: async (data: RegisterRequest): Promise<RegistrationResponse> => {
    const response = await apiClient.post('/api/v1/auth/register', data);
    return response.data;
  },
  
  login: async (data: LoginRequest): Promise<TokenResponse> => {
    const response = await apiClient.post('/api/v1/auth/login', data);
    return response.data;
  },

  verifyEmail: async (token: string): Promise<EmailVerificationResponse> => {
    const response = await apiClient.get('/api/v1/auth/verify-email', { params: { token } });
    return response.data;
  },

  resendVerificationEmail: async (email: string): Promise<EmailVerificationResponse> => {
    const response = await apiClient.post('/api/v1/auth/resend-verification', { email });
    return response.data;
  },
  
  checkEmail: async (email: string): Promise<{ available: boolean; message?: string }> => {
    const response = await apiClient.get('/api/v1/auth/check-email', {
      params: { email }
    });
    return response.data;
  },
};
