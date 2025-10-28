// frontend/src/store/__tests__/clubManagementStore.test.ts
import { renderHook, act } from '@testing-library/react';
import { vi } from 'vitest';
import { useClubManagementStore } from '../clubManagementStore';
import * as clubManagementService from '../../services/clubManagementService';
import type { ClubMember, ClubJoinRequest } from '../../types/clubManagement';

// Mock the service
vi.mock('../../services/clubManagementService');

describe('useClubManagementStore', () => {
  let mockMembers: ClubMember[];
  let mockRequests: ClubJoinRequest[];

  beforeEach(() => {
    // Reset mocks and store before each test
    vi.resetAllMocks();
    const { result } = renderHook(() => useClubManagementStore());
    act(() => {
      result.current.members = [];
      result.current.joinRequests = [];
      result.current.loading = false;
      result.current.error = null;
    });

    mockMembers = [{ user: { id: 1, display_name: 'Test User' }, role: 'owner' }];
    mockRequests = [{ id: 1, user: { id: 2, display_name: 'Requester' } }];
  });

  it('should fetch club management data successfully', async () => {
    (clubManagementService.getClubMembers as vi.Mock).mockResolvedValue(mockMembers);
    (clubManagementService.getJoinRequests as vi.Mock).mockResolvedValue(mockRequests);

    const { result } = renderHook(() => useClubManagementStore());

    await act(async () => {
      await result.current.fetchClubManagementData(1);
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.members).toEqual(mockMembers);
    expect(result.current.joinRequests).toEqual(mockRequests);
    expect(result.current.error).toBeNull();
  });

  it('should handle approve request correctly', async () => {
    const { result } = renderHook(() => useClubManagementStore());
    act(() => {
      result.current.joinRequests = mockRequests;
    });

    (clubManagementService.approveJoinRequest as vi.Mock).mockResolvedValue(undefined);
    (clubManagementService.getClubMembers as vi.Mock).mockResolvedValue(mockMembers); // For refresh
    (clubManagementService.getJoinRequests as vi.Mock).mockResolvedValue([]); // For refresh

    await act(async () => {
      await result.current.approveRequest(1, 1);
    });

    expect(result.current.joinRequests).toHaveLength(0);
  });

  it('should handle reject request correctly', async () => {
    const { result } = renderHook(() => useClubManagementStore());
    act(() => {
      result.current.joinRequests = mockRequests;
    });

    (clubManagementService.rejectJoinRequest as vi.Mock).mockResolvedValue(undefined);

    await act(async () => {
      await result.current.rejectRequest(1, 1);
    });

    expect(result.current.joinRequests).toHaveLength(0);
  });

  it('should handle update member role correctly', async () => {
    const { result } = renderHook(() => useClubManagementStore());
    act(() => {
      result.current.members = mockMembers;
    });

    const updatedMember = { ...mockMembers[0], role: 'admin' };
    (clubManagementService.updateMemberRole as vi.Mock).mockResolvedValue(updatedMember);

    await act(async () => {
      await result.current.updateMemberRole(1, 1, 'admin');
    });

    expect(result.current.members[0].role).toBe('admin');
  });

  it('should handle remove member correctly', async () => {
    const { result } = renderHook(() => useClubManagementStore());
    act(() => {
      result.current.members = mockMembers;
    });

    (clubManagementService.removeMember as vi.Mock).mockResolvedValue(undefined);

    await act(async () => {
      await result.current.removeMember(1, 1);
    });

    expect(result.current.members).toHaveLength(0);
  });

  it('should handle transfer ownership correctly', async () => {
    const { result } = renderHook(() => useClubManagementStore());
    (clubManagementService.transferOwnership as vi.Mock).mockResolvedValue(undefined);
    (clubManagementService.getClubMembers as vi.Mock).mockResolvedValue(mockMembers); // For refresh
    (clubManagementService.getJoinRequests as vi.Mock).mockResolvedValue([]); // For refresh

    await act(async () => {
      await result.current.transferOwnership(1, 2);
    });

    expect(clubManagementService.transferOwnership).toHaveBeenCalledWith(1, { new_owner_id: 2 });
    expect(result.current.loading).toBe(false);
  });

  it('should handle delete club correctly', async () => {
    const { result } = renderHook(() => useClubManagementStore());
    (clubManagementService.deleteClub as vi.Mock).mockResolvedValue(undefined);

    await act(async () => {
      await result.current.deleteClub(1);
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should set error state on failure', async () => {
    (clubManagementService.getClubMembers as vi.Mock).mockRejectedValue(new Error('Network Error'));
    (clubManagementService.getJoinRequests as vi.Mock).mockRejectedValue(new Error('Network Error'));

    const { result } = renderHook(() => useClubManagementStore());

    await act(async () => {
      await result.current.fetchClubManagementData(1);
    });

    expect(result.current.error).not.toBeNull();
    expect(result.current.members).toHaveLength(0);
  });
});
