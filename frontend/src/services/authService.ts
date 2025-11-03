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

  forgotPassword: async (email: string): Promise<{ message: string }> => {
    const response = await apiClient.post('/api/v1/auth/forgot-password', { email });
    return response.data;
  },

  verifyResetToken: async (token: string): Promise<{ valid: boolean; email: string | null }> => {
    const response = await apiClient.get('/api/v1/auth/verify-reset-token', { params: { token } });
    return response.data;
  },

  resetPassword: async (token: string, newPassword: string): Promise<{ message: string }> => {
    const response = await apiClient.post('/api/v1/auth/reset-password', {
      token,
      new_password: newPassword
    });
    return response.data;
  },
};
