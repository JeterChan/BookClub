import { create } from 'zustand';
import type { User, TokenResponse } from '../types/auth';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  login: (tokens: TokenResponse, rememberMe?: boolean) => void;
  logout: () => void;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  
  login: (tokens: TokenResponse, rememberMe = false) => {
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem('access_token', tokens.access_token);
    storage.setItem('refresh_token', tokens.refresh_token);
    
    set({
      user: tokens.user,
      accessToken: tokens.access_token,
      isAuthenticated: true
    });
  },
  
  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('refresh_token');
    
    set({
      user: null,
      accessToken: null,
      isAuthenticated: false
    });
  },
  
  initialize: () => {
    const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
    if (token) {
      set({
        accessToken: token,
        isAuthenticated: true
      });
    }
  }
}));
