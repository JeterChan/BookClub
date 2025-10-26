// frontend/src/store/bookClubStore.ts
import { create } from 'zustand';
import { 
  createBookClub as createBookClubService,
  getAvailableTags, 
  listBookClubs, 
  getBookClubById,
  joinClub as joinClubService,
  leaveClub as leaveClubService,
  requestToJoinClub as requestToJoinClubService
} from '../services/bookClubService';
import type { 
  BookClubCreateRequest, 
  BookClubRead, 
  ClubTag, 
  BookClubListItem, 
  PaginationMeta 
} from '../types/bookClub';
import type { ApiError } from '../types/error';

interface BookClubState {
  clubs: BookClubListItem[];
  availableTags: ClubTag[];
  detailClub: BookClubRead | null; // Consolidated state
  pagination: PaginationMeta | null;
  searchKeyword: string;
  selectedTagIds: number[];
  currentPage: number;
  loading: boolean;
  error: string | null;
  createSuccess: boolean;
  
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
  setDetailClub: (club: BookClubRead | null) => void; // Renamed from setCurrentClub
}

export const useBookClubStore = create<BookClubState>((set, get) => ({
  clubs: [],
  availableTags: [],
  detailClub: null, // Consolidated state
  pagination: null,
  searchKeyword: '',
  selectedTagIds: [],
  currentPage: 1,
  loading: false,
  error: null,
  createSuccess: false,
  
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
        detailClub: club, // Set detailClub with the full object
        createSuccess: true,
        clubs: [newClubListItem, ...state.clubs], // Prepend new club to the list
      }));
    } catch (error) {
      const apiError = error as ApiError;
      const errorMessage = apiError.response?.data?.detail || '建立讀書會失敗';
      set({
        loading: false,
        error: errorMessage,
      });
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
      const errorMessage = apiError.response?.data?.detail || '載入標籤失敗';
      set({
        loading: false,
        error: errorMessage,
      });
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
        tagIds: selectedTagIds.length > 0 ? selectedTagIds : undefined 
      });
      set({ 
        clubs: result.items, 
        pagination: result.pagination, 
        currentPage: page, 
        loading: false 
      });
    }
    catch (error) {
      const apiError = error as ApiError;
      const errorMessage = apiError.response?.data?.detail || '載入讀書會失敗';
      set({ 
        error: errorMessage, 
        loading: false 
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
        loading: false 
      });
    }
  },

  joinClub: async (clubId: number) => {
    set({ loading: true, error: null });
    try {
      await joinClubService(clubId);
      set((state) => {
        const updatedDetailClub = state.detailClub && state.detailClub.id === clubId
          ? { ...state.detailClub, membership_status: 'member' as const, member_count: state.detailClub.member_count + 1 }
          : state.detailClub;

        const updatedClubs = state.clubs.map(club => 
          club.id === clubId 
            ? { ...club, member_count: club.member_count + 1 } 
            : club
        );

        return {
          loading: false,
          detailClub: updatedDetailClub,
          clubs: updatedClubs,
        };
      });
    } catch (error) {
      const apiError = error as ApiError;
      const errorMessage = apiError.response?.data?.detail || '加入讀書會失敗';
      set({ loading: false, error: errorMessage });
    }
  },

  leaveClub: async (clubId: number) => {
    set({ loading: true, error: null });
    try {
      await leaveClubService(clubId);
      set((state) => {
        const updatedDetailClub = state.detailClub && state.detailClub.id === clubId
          ? { ...state.detailClub, membership_status: 'not_member' as const, member_count: state.detailClub.member_count - 1 }
          : state.detailClub;

        const updatedClubs = state.clubs.map(club => 
          club.id === clubId 
            ? { ...club, member_count: Math.max(0, club.member_count - 1) } 
            : club
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
    }
  },
  
  resetCreateSuccess: () => set({ createSuccess: false }),
  clearError: () => set({ error: null }),
  setDetailClub: (club) => set({ detailClub: club }), // Renamed from setCurrentClub
}));

