import { apiClient } from './api';
import type { RegisterRequest, LoginRequest, TokenResponse, GoogleLoginResponse, RegistrationResponse, EmailVerificationResponse } from '../types/auth';

export const authService = {
  register: async (data: RegisterRequest): Promise<RegistrationResponse> => {
    const response = await apiClient.post('/api/auth/register', data);
    return response.data;
  },
  
  login: async (data: LoginRequest): Promise<TokenResponse> => {
    const response = await apiClient.post('/api/auth/login', data);
    return response.data;
  },

  verifyEmail: async (token: string): Promise<EmailVerificationResponse> => {
    const response = await apiClient.get('/api/auth/verify-email', { params: { token } });
    return response.data;
  },

  resendVerificationEmail: async (email: string): Promise<EmailVerificationResponse> => {
    const response = await apiClient.post('/api/auth/resend-verification', { email });
    return response.data;
  },
  
  checkEmail: async (email: string): Promise<{ available: boolean; message?: string }> => {
    const response = await apiClient.get('/api/auth/check-email', {
      params: { email }
    });
    return response.data;
  },
  
  googleLogin: async (credential: string): Promise<GoogleLoginResponse> => {
    const response = await apiClient.post('/api/auth/google/login', { id_token: credential });
    return response.data;
  }
};
