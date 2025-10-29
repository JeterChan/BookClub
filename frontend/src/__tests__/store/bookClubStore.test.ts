// frontend/src/__tests__/store/bookClubStore.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useBookClubStore } from '../../store/bookClubStore';
import * as bookClubService from '../../services/bookClubService';

// Mock the service
vi.mock('../../services/bookClubService');

describe('bookClubStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useBookClubStore.setState({
      clubs: [],
      availableTags: [],
      detailClub: null,
      pagination: null,
      searchKeyword: '',
      selectedTagIds: [],
      currentPage: 1,
      loading: false,
      error: null,
      createSuccess: false,
    });
    vi.clearAllMocks();
  });

  describe('createBookClub', () => {
    it('should create a book club successfully', async () => {
      const mockClubResponse = {
        id: 1,
        name: 'Test Club',
        description: 'Test description',
        visibility: 'public' as const,
        owner_id: 1,
        owner: {
          id: 1,
          email: 'test@example.com',
          display_name: 'Test User',
        },
        tags: [
          { id: 1, name: '文學', is_predefined: true },
          { id: 2, name: '科技', is_predefined: true },
        ],
        member_count: 1,
        cover_image_url: undefined,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      const expectedClubInState = {
        id: 1,
        name: 'Test Club',
        description: 'Test description',
        visibility: 'public' as const,
        owner: {
          id: 1,
          email: 'test@example.com',
          display_name: 'Test User',
        },
        tags: [
          { id: 1, name: '文學', is_predefined: true },
          { id: 2, name: '科技', is_predefined: true },
        ],
        member_count: 1,
        cover_image_url: null, // Changed from undefined
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      vi.mocked(bookClubService.createBookClub).mockResolvedValue(mockClubResponse);

      const store = useBookClubStore.getState();
      await store.createBookClub({
        name: 'Test Club',
        description: 'Test description',
        visibility: 'public',
        tag_ids: [1, 2],
      });

      const state = useBookClubStore.getState();
      expect(state.loading).toBe(false);
      expect(state.createSuccess).toBe(true);
      expect(state.clubs).toHaveLength(1);
      expect(state.clubs[0]).toEqual(expectedClubInState);
      expect(state.detailClub).toEqual(mockClubResponse);
      expect(state.error).toBeNull();
    });

    it('should handle errors when creating a book club', async () => {
      const mockError = {
        response: {
          data: {
            detail: '讀書會名稱已存在',
          },
        },
      };

      vi.mocked(bookClubService.createBookClub).mockRejectedValue(mockError);

      const store = useBookClubStore.getState();
      
      await expect(
        store.createBookClub({
          name: 'Test Club',
          description: 'Test description',
          visibility: 'public',
          tag_ids: [1, 2],
        })
      ).rejects.toEqual(mockError);

      const state = useBookClubStore.getState();
      expect(state.loading).toBe(false);
      expect(state.createSuccess).toBe(false);
      expect(state.error).toBe('讀書會名稱已存在'); // Expect the specific error message
    });

    it('should handle generic errors when creating a book club', async () => {
      vi.mocked(bookClubService.createBookClub).mockRejectedValue(new Error('Network error'));

      const store = useBookClubStore.getState();
      
      await expect(
        store.createBookClub({
          name: 'Test Club',
          description: 'Test description',
          visibility: 'public',
          tag_ids: [1, 2],
        })
      ).rejects.toThrow('Network error');

      const state = useBookClubStore.getState();
      expect(state.loading).toBe(false);
      expect(state.error).toBe('建立讀書會失敗');
    });
  });

  describe('fetchAvailableTags', () => {
    it('should fetch available tags successfully', async () => {
      const mockTags = [
        { id: 1, name: '文學', is_predefined: true },
        { id: 2, name: '科技', is_predefined: true },
        { id: 3, name: '商業', is_predefined: true },
      ];

      vi.mocked(bookClubService.getAvailableTags).mockResolvedValue(mockTags);

      const store = useBookClubStore.getState();
      await store.fetchAvailableTags();

      const state = useBookClubStore.getState();
      expect(state.loading).toBe(false);
      expect(state.availableTags).toEqual(mockTags);
      expect(state.error).toBeNull();
    });

    it('should handle errors when fetching tags', async () => {
      const mockError = {
        response: {
          data: {
            detail: '無法載入標籤',
          },
        },
      };

      vi.mocked(bookClubService.getAvailableTags).mockRejectedValue(mockError);

      const store = useBookClubStore.getState();
      await expect(store.fetchAvailableTags()).rejects.toEqual(mockError);

      const state = useBookClubStore.getState();
      expect(state.loading).toBe(false);
      expect(state.error).toBe('無法載入標籤'); // Expect the specific error
    });
  });

  describe('resetCreateSuccess', () => {
    it('should reset create success flag', () => {
      useBookClubStore.setState({ createSuccess: true });

      const store = useBookClubStore.getState();
      store.resetCreateSuccess();

      expect(useBookClubStore.getState().createSuccess).toBe(false);
    });
  });

  describe('clearError', () => {
    it('should clear error message', () => {
      useBookClubStore.setState({ error: 'Test error' });

      const store = useBookClubStore.getState();
      store.clearError();

      expect(useBookClubStore.getState().error).toBeNull();
    });
  });

  describe('setDetailClub', () => {
    it('should set detail club', () => {
      const mockClub = {
        id: 1,
        name: 'Test Club',
        description: 'Test description',
        visibility: 'public' as const,
        owner_id: 1,
        owner: {
          id: 1,
          email: 'test@example.com',
          display_name: 'Test User',
        },
        tags: [],
        member_count: 1,
        cover_image_url: undefined,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      const store = useBookClubStore.getState();
      store.setDetailClub(mockClub);

      expect(useBookClubStore.getState().detailClub).toEqual(mockClub);
    });
  });
});
