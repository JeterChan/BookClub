import { create } from 'zustand';
import {
  createBookClub as createBookClubService,
  getAvailableTags,
  listBookClubs,
  getBookClubById,
  joinClub as joinClubService,
  leaveClub as leaveClubService,
  requestToJoinClub as requestToJoinClubService,
  getDiscussions,
  createDiscussion,
  getDiscussion,
  createComment,
} from '../services/bookClubService';
import type {
  BookClubCreateRequest,
  BookClubRead,
  ClubTag,
  BookClubListItem,
  PaginationMeta,
} from '../types/bookClub';
import type { DiscussionTopic } from '../types/discussion';
import type { ApiError } from '../types/error';

interface BookClubState {
  clubs: BookClubListItem[];
  availableTags: ClubTag[];
  detailClub: BookClubRead | null;
  pagination: PaginationMeta | null;
  searchKeyword: string;
  selectedTagIds: number[];
  currentPage: number;
  loading: boolean;
  error: string | null;
  createSuccess: boolean;
  discussions: DiscussionTopic[];
  currentTopic: DiscussionTopic | null;

  // Actions
  createBookClub: (data: BookClubCreateRequest) => Promise<void>;
  fetchAvailableTags: () => Promise<void>;
  fetchClubs: (page?: number, pageSize?: number) => Promise<void>;
  setSearchKeyword: (keyword: string) => void;
  setSelectedTagIds: (tagIds: number[]) => void;
  fetchClubDetail: (clubId: number) => Promise<void>;
  joinClub: (clubId: number) => Promise<void>;
  leaveClub: (clubId: number) => Promise<void>;
  requestToJoinClub: (clubId: number) => Promise<void>;
  resetCreateSuccess: () => void;
  clearError: () => void;
  setDetailClub: (club: BookClubRead | null) => void;
  fetchDiscussions: (clubId: number) => Promise<void>;
  addDiscussion: (clubId: number, data: { title: string; content: string }) => Promise<void>;
  fetchDiscussion: (clubId: number, topicId: number) => Promise<void>;
  addComment: (clubId: number, topicId: number, data: { content: string }) => Promise<void>;
}

export const useBookClubStore = create<BookClubState>((set, get) => ({
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
  discussions: [],
  currentTopic: null,

  createBookClub: async (data: BookClubCreateRequest) => {
    set({ loading: true, error: null, createSuccess: false });
    try {
      const club = await createBookClubService(data);

      const newClubListItem: BookClubListItem = {
        id: club.id,
        name: club.name,
        visibility: club.visibility,
        cover_image_url: club.cover_image_url ?? null,
        description: club.description ?? null,
        member_count: club.member_count,
        created_at: club.created_at,
        updated_at: club.updated_at,
        owner: club.owner,
        tags: club.tags,
      };

      set((state) => ({
        loading: false,
        detailClub: club,
        createSuccess: true,
        clubs: [newClubListItem, ...state.clubs],
      }));
    } catch (error) {
      const apiError = error as ApiError;
      const errorMessage = apiError.response?.data?.detail || '建立讀書會失敗';
      set({
        loading: false,
        error: errorMessage,
      });
      throw error;
    }
  },

  fetchAvailableTags: async () => {
    set({ loading: true, error: null });
    try {
      const tags = await getAvailableTags();
      set({
        loading: false,
        availableTags: tags,
      });
    } catch (error) {
      const apiError = error as ApiError;
      const errorMessage = apiError.response?.data?.detail || '無法載入標籤';
      set({
        loading: false,
        error: errorMessage,
      });
      throw error;
    }
  },

  fetchClubs: async (page = 1, pageSize = 20) => {
    set({ loading: true, error: null });
    try {
      const { searchKeyword, selectedTagIds } = get();
      const result = await listBookClubs({
        page,
        pageSize,
        keyword: searchKeyword || undefined,
        tagIds: selectedTagIds.length > 0 ? selectedTagIds : undefined,
      });
      set({
        clubs: result.items,
        pagination: result.pagination,
        currentPage: page,
        loading: false,
      });
    } catch (error) {
      const apiError = error as ApiError;
      const errorMessage = apiError.response?.data?.detail || '載入讀書會失敗';
      set({
        error: errorMessage,
        loading: false,
      });
    }
  },

  setSearchKeyword: (keyword: string) => {
    set({ searchKeyword: keyword });
  },

  setSelectedTagIds: (tagIds: number[]) => {
    set({ selectedTagIds: tagIds });
  },

  fetchClubDetail: async (clubId: number) => {
    set({ loading: true, error: null });
    try {
      const club = await getBookClubById(clubId);
      set({ detailClub: club, loading: false });
    } catch (error) {
      const apiError = error as ApiError;
      const errorMessage = apiError.response?.data?.detail || '載入讀書會詳情失敗';
      set({
        error: errorMessage,
        loading: false,
      });
    }
  },

  joinClub: async (clubId: number) => {
    set({ loading: true, error: null });
    try {
      await joinClubService(clubId);
      set((state) => {
        const updatedDetailClub =
          state.detailClub && state.detailClub.id === clubId
            ? { ...state.detailClub, membership_status: 'pending_request' as const }
            : state.detailClub;

        return {
          loading: false,
          detailClub: updatedDetailClub,
          clubs: state.clubs, // 不更新成員數，因為還在等待審核
        };
      });
    } catch (error) {
      const apiError = error as ApiError;
      const errorMessage = apiError.response?.data?.detail || '加入讀書會失敗';
      set({ loading: false, error: errorMessage });
      throw error;
    }
  },

  leaveClub: async (clubId: number) => {
    set({ loading: true, error: null });
    try {
      await leaveClubService(clubId);
      set((state) => {
        const updatedDetailClub =
          state.detailClub && state.detailClub.id === clubId
            ? { ...state.detailClub, membership_status: 'not_member' as const, member_count: state.detailClub.member_count - 1 }
            : state.detailClub;

        const updatedClubs = state.clubs.map((club) =>
          club.id === clubId ? { ...club, member_count: Math.max(0, club.member_count - 1) } : club
        );

        return {
          loading: false,
          detailClub: updatedDetailClub,
          clubs: updatedClubs,
        };
      });
    } catch (error) {
      const apiError = error as ApiError;
      const errorMessage = apiError.response?.data?.detail || '退出讀書會失敗';
      set({ loading: false, error: errorMessage });
      throw error;
    }
  },

  requestToJoinClub: async (clubId: number) => {
    set({ loading: true, error: null });
    try {
      await requestToJoinClubService(clubId);
      set((state) => {
        if (state.detailClub && state.detailClub.id === clubId) {
          return {
            loading: false,
            detailClub: {
              ...state.detailClub,
              membership_status: 'pending_request' as const,
            },
          };
        }
        return { loading: false };
      });
    } catch (error) {
      const apiError = error as ApiError;
      const errorMessage = apiError.response?.data?.detail || '請求加入失敗';
      set({ loading: false, error: errorMessage });
      throw error;
    }
  },

  resetCreateSuccess: () => set({ createSuccess: false }),
  clearError: () => set({ error: null }),
  setDetailClub: (club) => set({ detailClub: club }),

  fetchDiscussions: async (clubId) => {
    set({ loading: true, error: null });
    try {
      const discussions = await getDiscussions(clubId);
      set({ discussions, loading: false });
    } catch (error) {
      set({ error: 'Failed to fetch discussions', loading: false });
    }
  },
  addDiscussion: async (clubId, data) => {
    set({ loading: true, error: null });
    try {
      const newTopic = await createDiscussion(clubId, data);
      set((state) => ({ discussions: [...state.discussions, newTopic], loading: false }));
    } catch (error) {
      set({ error: 'Failed to add discussion', loading: false });
    }
  },
  fetchDiscussion: async (clubId, topicId) => {
    set({ loading: true, error: null });
    try {
      const topic = await getDiscussion(clubId, topicId);
      set({ currentTopic: topic, loading: false });
    } catch (error) {
      set({ error: 'Failed to fetch discussion', loading: false });
    }
  },
  addComment: async (clubId, topicId, data) => {
    set({ loading: true, error: null });
    try {
      await createComment(clubId, topicId, data);
      const topic = await getDiscussion(clubId, topicId);
      set({ currentTopic: topic, loading: false });
    } catch (error) {
      set({ error: 'Failed to add comment', loading: false });
    }
  },
}));
