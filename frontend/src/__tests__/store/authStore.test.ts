import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useAuthStore } from '../../store/authStore';
import { profileService } from '../../services/profileService';
import type { TokenResponse } from '../../types/auth';
import type { UserProfile } from '../../services/profileService';

// Mock profileService
vi.mock('../../services/profileService', () => ({
  profileService: {
    getProfile: vi.fn(),
  },
}));

describe('useAuthStore', () => {
  const mockTokenResponse: TokenResponse = {
    access_token: 'test-token',
    token_type: 'bearer',
  };

  const mockUserProfile: UserProfile = {
    id: 1,
    email: 'test@example.com',
    display_name: 'Test User',
    is_active: true,
    created_at: '2023-01-01T00:00:00Z',
    interest_tags: [],
  };

  beforeEach(() => {
    // Reset store state
    useAuthStore.setState({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isInitializing: true,
    });
    
    // Clear mocks
    vi.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();
  });

  describe('login', () => {
    it('should update state and fetch profile on successful login', async () => {
      // Setup mock
      (profileService.getProfile as any).mockResolvedValue(mockUserProfile);

      // Execute
      await useAuthStore.getState().login(mockTokenResponse, true);

      // Assert
      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(true);
      expect(state.accessToken).toBe('test-token');
      expect(state.user).toEqual(mockUserProfile);
      expect(localStorage.getItem('access_token')).toBe('test-token');
    });

    it('should use sessionStorage when rememberMe is false', async () => {
      (profileService.getProfile as any).mockResolvedValue(mockUserProfile);

      await useAuthStore.getState().login(mockTokenResponse, false);

      expect(sessionStorage.getItem('access_token')).toBe('test-token');
      expect(localStorage.getItem('access_token')).toBeNull();
    });

    it('should handle profile fetch failure gracefully', async () => {
      (profileService.getProfile as any).mockRejectedValue(new Error('Failed'));

      await useAuthStore.getState().login(mockTokenResponse);

      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(true); // Still authenticated
      expect(state.user).toBeNull(); // But no user data
    });
  });

  describe('logout', () => {
    it('should clear state and storage', () => {
      // Setup initial state
      localStorage.setItem('access_token', 'token');
      useAuthStore.setState({
        isAuthenticated: true,
        accessToken: 'token',
        user: mockUserProfile,
      });

      // Execute
      useAuthStore.getState().logout();

      // Assert
      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(false);
      expect(state.accessToken).toBeNull();
      expect(state.user).toBeNull();
      expect(localStorage.getItem('access_token')).toBeNull();
    });
  });

  describe('initialize', () => {
    it('should restore session if token exists', async () => {
      // Setup storage
      localStorage.setItem('access_token', 'stored-token');
      (profileService.getProfile as any).mockResolvedValue(mockUserProfile);

      // Execute
      await useAuthStore.getState().initialize();

      // Assert
      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(true);
      expect(state.accessToken).toBe('stored-token');
      expect(state.user).toEqual(mockUserProfile);
      expect(state.isInitializing).toBe(false);
    });

    it('should handle invalid token during initialization', async () => {
      localStorage.setItem('access_token', 'invalid-token');
      (profileService.getProfile as any).mockRejectedValue(new Error('Unauthorized'));

      await useAuthStore.getState().initialize();

      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBeNull();
      expect(state.isInitializing).toBe(false);
    });

    it('should do nothing if no token found', async () => {
      await useAuthStore.getState().initialize();

      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isInitializing).toBe(false);
    });
  });
});
