// frontend/src/store/clubManagementStore.ts
import { create } from 'zustand';
import * as clubManagementService from '../services/clubManagementService';
import type {
  ClubMember,
  ClubJoinRequest,
  BookClubUpdateRequest,
  MemberRole,
} from '../types/clubManagement';
import { useBookClubStore } from './bookClubStore';

interface ClubManagementState {
  members: ClubMember[];
  joinRequests: ClubJoinRequest[];
  loading: boolean;
  error: string | null;
  fetchClubManagementData: (clubId: number) => Promise<void>;
  approveRequest: (clubId: number, requestId: number) => Promise<void>;
  rejectRequest: (clubId: number, requestId: number) => Promise<void>;
  updateMemberRole: (clubId: number, userId: number, role: MemberRole) => Promise<void>;
  removeMember: (clubId: number, userId: number) => Promise<void>;
  transferOwnership: (clubId: number, newOwnerId: number) => Promise<void>;
  updateClubDetails: (clubId: number, data: BookClubUpdateRequest) => Promise<void>;
}

export const useClubManagementStore = create<ClubManagementState>((set, get) => ({
  members: [],
  joinRequests: [],
  loading: false,
  error: null,

  fetchClubManagementData: async (clubId) => {
    set({ loading: true, error: null });
    try {
      const [members, joinRequests] = await Promise.all([
        clubManagementService.getClubMembers(clubId),
        clubManagementService.getJoinRequests(clubId),
      ]);
      set({ members, joinRequests, loading: false });
    } catch {
      set({ error: 'Failed to fetch club management data.', loading: false });
    }
  },

  approveRequest: async (clubId, requestId) => {
    set({ loading: true, error: null });
    try {
      await clubManagementService.approveJoinRequest(clubId, requestId);
      set((state) => ({
        joinRequests: state.joinRequests.filter((req) => req.id !== requestId),
        loading: false,
      }));
      // Refresh members list
      get().fetchClubManagementData(clubId);
    } catch {
      set({ error: 'Failed to approve request.', loading: false });
    }
  },

  rejectRequest: async (clubId, requestId) => {
    set({ loading: true, error: null });
    try {
      await clubManagementService.rejectJoinRequest(clubId, requestId);
      set((state) => ({
        joinRequests: state.joinRequests.filter((req) => req.id !== requestId),
        loading: false,
      }));
    } catch {
      set({ error: 'Failed to reject request.', loading: false });
    }
  },

  updateMemberRole: async (clubId, userId, role) => {
    set({ loading: true, error: null });
    try {
      const updatedMember = await clubManagementService.updateMemberRole(clubId, userId, { role });
      set((state) => ({
        members: state.members.map((m) => (m.user.id === userId ? updatedMember : m)),
        loading: false,
      }));
    } catch {
      set({ error: 'Failed to update role.', loading: false });
    }
  },

  removeMember: async (clubId, userId) => {
    set({ loading: true, error: null });
    try {
      await clubManagementService.removeMember(clubId, userId);
      set((state) => ({
        members: state.members.filter((m) => m.user.id !== userId),
        loading: false,
      }));
    } catch {
      set({ error: 'Failed to remove member.', loading: false });
    }
  },

  transferOwnership: async (clubId, newOwnerId) => {
    set({ loading: true, error: null });
    try {
      await clubManagementService.transferOwnership(clubId, { new_owner_id: newOwnerId });
      // After transfer, the current user might be an admin, so we need to refresh everything
      get().fetchClubManagementData(clubId);
      useBookClubStore.getState().fetchClubDetail(clubId); // Also refresh detail view
      set({ loading: false });
    } catch {
      set({ error: 'Failed to transfer ownership.', loading: false });
    }
  },

  updateClubDetails: async (clubId, data) => {
    set({ loading: true, error: null });
    try {
      const updatedClub = await clubManagementService.updateClubDetails(clubId, data);
      useBookClubStore.getState().setDetailClub(updatedClub); // Update the other store
      set({ loading: false });
    } catch {
      set({ error: 'Failed to update club details.', loading: false });
    }
  },

  deleteClub: async (clubId) => {
    set({ loading: true, error: null });
    try {
      await clubManagementService.deleteClub(clubId);
      set({ loading: false });
    } catch (err) {
      const message = err.response?.data?.detail || 'Failed to delete club.';
      set({ error: message, loading: false });
      throw new Error(message);
    }
  },
}));
