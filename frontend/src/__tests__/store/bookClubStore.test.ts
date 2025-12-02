import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useBookClubStore } from '../../store/bookClubStore';
import {
  listBookClubs,
  getBookClubById,
  joinClub,
  leaveClub
} from '../../services/bookClubService';

// Mock bookClubService
vi.mock('../../services/bookClubService', () => ({
  createBookClub: vi.fn(),
  getAvailableTags: vi.fn(),
  listBookClubs: vi.fn(),
  getBookClubById: vi.fn(),
  joinClub: vi.fn(),
  leaveClub: vi.fn(),
  getDiscussions: vi.fn(),
  createDiscussion: vi.fn(),
  getDiscussion: vi.fn(),
  createComment: vi.fn(),
}));

describe('useBookClubStore', () => {
  beforeEach(() => {
    useBookClubStore.setState({
      clubs: [],
      detailClub: null,
      loading: false,
      error: null,
      searchKeyword: '',
      selectedTagIds: [],
    });
    vi.clearAllMocks();
  });

  describe('fetchClubs', () => {
    it('should fetch clubs successfully', async () => {
      const mockResponse = {
        items: [{ id: 1, name: 'Test Club', member_count: 10 }],
        pagination: { total_pages: 1, current_page: 1 },
      };
      (listBookClubs as any).mockResolvedValue(mockResponse);

      await useBookClubStore.getState().fetchClubs();

      const state = useBookClubStore.getState();
      expect(state.clubs).toEqual(mockResponse.items);
      expect(state.pagination).toEqual(mockResponse.pagination);
      expect(state.loading).toBe(false);
      expect(listBookClubs).toHaveBeenCalledWith({
        page: 1,
        pageSize: 20,
        keyword: undefined,
        tagIds: undefined
      });
    });

    it('should fetch clubs with search keyword', async () => {
      useBookClubStore.getState().setSearchKeyword('Python');
      (listBookClubs as any).mockResolvedValue({ items: [], pagination: {} });

      await useBookClubStore.getState().fetchClubs();

      expect(listBookClubs).toHaveBeenCalledWith(expect.objectContaining({
        keyword: 'Python'
      }));
    });
  });

  describe('joinClub', () => {
    it('should update club membership status on join', async () => {
      // Setup initial state
      const initialClub = { id: 1, name: 'Club', member_count: 10, membership_status: 'not_member' };
      useBookClubStore.setState({
        detailClub: initialClub as any,
        clubs: [initialClub as any]
      });

      (joinClub as any).mockResolvedValue({ joined: true, requires_approval: false });

      await useBookClubStore.getState().joinClub(1);

      const state = useBookClubStore.getState();
      expect(state.detailClub?.membership_status).toBe('member');
      expect(state.detailClub?.member_count).toBe(11);
      expect(state.clubs[0].member_count).toBe(11);
    });
  });

  describe('leaveClub', () => {
    it('should update club membership status on leave', async () => {
      const initialClub = { id: 1, name: 'Club', member_count: 10, membership_status: 'member' };
      useBookClubStore.setState({
        detailClub: initialClub as any,
        clubs: [initialClub as any]
      });

      (leaveClub as any).mockResolvedValue({});

      await useBookClubStore.getState().leaveClub(1);

      const state = useBookClubStore.getState();
      expect(state.detailClub?.membership_status).toBe('not_member');
      expect(state.detailClub?.member_count).toBe(9);
      expect(state.clubs[0].member_count).toBe(9);
    });
  });
});