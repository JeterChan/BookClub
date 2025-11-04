// frontend/src/store/authStore.ts
import { create } from 'zustand';
import { profileService } from '../services/profileService';
import type { UserProfile } from '../services/profileService';
import type { TokenResponse } from '../types/auth';

// Define state properties
interface AuthState {
  user: UserProfile | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
}

// Define actions
interface AuthActions {
  login: (tokens: TokenResponse, rememberMe?: boolean) => void;
  logout: () => void;
  initialize: () => Promise<void>;
  setUser: (user: UserProfile | null) => void;
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isInitializing: true,
};

// By defining actions outside the create call, we ensure their references are stable
const actions = (set: (fn: (state: AuthState) => AuthState) => void): AuthActions => ({
  login: async (tokens, rememberMe = false) => {
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem('access_token', tokens.access_token);
    set(state => ({ 
      ...state,
      accessToken: tokens.access_token, 
      isAuthenticated: true,
    }));

    try {
      const userProfile = await profileService.getProfile();
      set(state => ({ ...state, user: userProfile, isInitializing: false }));
    } catch (error) {
      console.error('Failed to fetch profile after login:', error);
      // If profile fetch fails, keep authenticated but without user data
      set(state => ({ ...state, user: null, isInitializing: false }));
    }
  },

  logout: () => {
    localStorage.removeItem('access_token');
    sessionStorage.removeItem('access_token');
    // Reset state but explicitly set isInitializing to false
    set(() => ({ ...initialState, isInitializing: false }));
  },

  initialize: async () => {
    try {
      const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
      if (token) {
        set(state => ({ ...state, accessToken: token, isAuthenticated: true }));
        const userProfile = await profileService.getProfile();
        set(state => ({ ...state, user: userProfile }));
      }
    } catch (error) {
      console.error('Failed to initialize auth state:', error);
      // If fetching profile fails, treat as unauthenticated
      set(() => initialState);
    } finally {
      set(state => ({ ...state, isInitializing: false }));
    }
  },

  setUser: (user) => {
    set(state => ({ ...state, user }));
  },
});

export const useAuthStore = create<AuthState & AuthActions>((set) => ({
  ...initialState,
  ...actions(set),
}));
