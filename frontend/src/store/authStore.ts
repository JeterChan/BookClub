// frontend/src/store/authStore.ts
import { create } from 'zustand';
import type { User, TokenResponse, GoogleLoginResponse } from '../types/auth';
import { profileService } from '../services/profileService';

// Define state properties
interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
}

// Define actions
interface AuthActions {
  login: (tokens: TokenResponse, rememberMe?: boolean) => void;
  loginWithGoogle: (response: GoogleLoginResponse) => void;
  logout: () => void;
  initialize: () => Promise<void>;
  setUser: (user: User | null) => void;
  syncFromStorage: () => Promise<void>;
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isInitializing: true,
};

// By defining actions outside the create call, we ensure their references are stable
const actions = (set: (fn: (state: AuthState) => AuthState) => void): AuthActions => ({
  login: (tokens, rememberMe = true) => {
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem('access_token', tokens.access_token);
    set(state => ({ 
      ...state,
      user: tokens.user, 
      accessToken: tokens.access_token, 
      isAuthenticated: true 
    }));
  },

  loginWithGoogle: (response) => {
    localStorage.setItem('access_token', response.access_token);
    set(state => ({ 
      ...state,
      accessToken: response.access_token, 
      isAuthenticated: true 
    }));
  },

  logout: () => {
    localStorage.removeItem('access_token');
    sessionStorage.removeItem('access_token');
    set(() => ({ ...initialState, isInitializing: false }));
  },

  initialize: async () => {
    try {
      const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
      if (token) {
        set(state => ({ ...state, accessToken: token, isAuthenticated: true }));
        const userProfile = await profileService.getProfile();
        // Convert UserProfile to User by adding missing fields
        const user: User = {
          ...userProfile,
          avatar_url: userProfile.avatar_url ?? undefined,
          bio: userProfile.bio ?? undefined,
          is_active: true, // Assume active if profile fetch succeeds
          created_at: new Date().toISOString() // Use current time as fallback
        };
        set(state => ({ ...state, user }));
      }
    } catch (error) {
      // If fetching profile fails, treat as unauthenticated
      set(() => ({ ...initialState, isInitializing: false }));
    } finally {
      set(state => ({ ...state, isInitializing: false }));
    }
  },

  syncFromStorage: async () => {
    try {
      const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
      if (token) {
        set(state => ({ ...state, accessToken: token, isAuthenticated: true }));
        const userProfile = await profileService.getProfile();
        // Convert UserProfile to User by adding missing fields
        const user: User = {
          ...userProfile,
          avatar_url: userProfile.avatar_url ?? undefined,
          bio: userProfile.bio ?? undefined,
          is_active: true,
          created_at: new Date().toISOString()
        };
        set(state => ({ ...state, user }));
      } else {
        set(() => ({ ...initialState, isInitializing: false }));
      }
    } catch (error) {
      set(() => ({ ...initialState, isInitializing: false }));
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
