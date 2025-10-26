import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useBookClubStore } from '../bookClubStore';
import * as bookClubService from '../../services/bookClubService';

// Mock the bookClubService
vi.mock('../../services/bookClubService', () => ({
  joinClub: vi.fn(),
  leaveClub: vi.fn(),
  requestToJoinClub: vi.fn(),
}));

const initialStoreState = useBookClubStore.getState();

// Helper to reset store before each test
const resetStore = () => useBookClubStore.setState(initialStoreState, true);

describe('BookClubStore - Membership Actions', () => {
  beforeEach(() => {
    resetStore();
    vi.clearAllMocks();
  });

  const clubId = 123;
  const initialDetailClub = {
    id: clubId,
    name: 'Test Club',
    description: 'A club for testing',
    visibility: 'public' as const,
    owner: { id: 1, display_name: 'Owner', email: 'owner@test.com' },
    tags: [],
    member_count: 5,
    membership_status: 'not_member' as const,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  describe('joinClub', () => {
    it('should update membership_status to "member" on successful join', async () => {
      const { result } = renderHook(() => useBookClubStore());
      
      // Set an initial club in the store
      act(() => {
        useBookClubStore.setState({ detailClub: initialDetailClub });
      });

      // Mock the service call to resolve successfully
      (bookClubService.joinClub as vi.Mock).mockResolvedValue(undefined);

      // Call the action
      await act(async () => {
        await result.current.joinClub(clubId);
      });

      // Assertions
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.detailClub?.membership_status).toBe('member');
      expect(result.current.detailClub?.member_count).toBe(initialDetailClub.member_count + 1);
    });

    it('should set an error message on failed join', async () => {
      const { result } = renderHook(() => useBookClubStore());
      const errorMessage = '加入讀書會失敗';

      act(() => {
        useBookClubStore.setState({ detailClub: initialDetailClub });
      });

      // Mock the service call to reject
      (bookClubService.joinClub as vi.Mock).mockRejectedValue(new Error(errorMessage));

      // Call the action and expect it to throw
      await act(async () => {
        await expect(result.current.joinClub(clubId)).rejects.toThrow(errorMessage);
      });

      // Assertions
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toContain(errorMessage);
      expect(result.current.detailClub?.membership_status).toBe('not_member');
    });
  });

  describe('leaveClub', () => {
    it('should update membership_status to "not_member" on successful leave', async () => {
      const { result } = renderHook(() => useBookClubStore());
      
      act(() => {
        useBookClubStore.setState({ detailClub: { ...initialDetailClub, membership_status: 'member' } });
      });

      (bookClubService.leaveClub as vi.Mock).mockResolvedValue(undefined);

      await act(async () => {
        await result.current.leaveClub(clubId);
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.detailClub?.membership_status).toBe('not_member');
      expect(result.current.detailClub?.member_count).toBe(initialDetailClub.member_count - 1);
    });

    it('should set an error on failed leave', async () => {
      const { result } = renderHook(() => useBookClubStore());
      const errorMessage = '退出讀書會失敗';

      act(() => {
        useBookClubStore.setState({ detailClub: { ...initialDetailClub, membership_status: 'member' } });
      });

      (bookClubService.leaveClub as vi.Mock).mockRejectedValue(new Error(errorMessage));

      await act(async () => {
        await expect(result.current.leaveClub(clubId)).rejects.toThrow(errorMessage);
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.error).toContain(errorMessage);
      expect(result.current.detailClub?.membership_status).toBe('member');
    });
  });

  describe('requestToJoinClub', () => {
    it('should update membership_status to "pending_request" on successful request', async () => {
      const { result } = renderHook(() => useBookClubStore());
      
      act(() => {
        useBookClubStore.setState({ detailClub: { ...initialDetailClub, visibility: 'private' } });
      });

      (bookClubService.requestToJoinClub as vi.Mock).mockResolvedValue(undefined);

      await act(async () => {
        await result.current.requestToJoinClub(clubId);
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.detailClub?.membership_status).toBe('pending_request');
    });

    it('should set an error on failed request', async () => {
      const { result } = renderHook(() => useBookClubStore());
      const errorMessage = '請求加入失敗';

      act(() => {
        useBookClubStore.setState({ detailClub: { ...initialDetailClub, visibility: 'private' } });
      });

      (bookClubService.requestToJoinClub as vi.Mock).mockRejectedValue(new Error(errorMessage));

      await act(async () => {
        await expect(result.current.requestToJoinClub(clubId)).rejects.toThrow(errorMessage);
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.error).toContain(errorMessage);
      expect(result.current.detailClub?.membership_status).toBe('not_member');
    });
  });
});
