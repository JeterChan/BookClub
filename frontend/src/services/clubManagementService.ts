// frontend/src/services/clubManagementService.ts
import api from './apiClient';
import type {
  BookClubUpdateRequest,
  ClubJoinRequest,
  ClubMember,
  UpdateMemberRoleRequest,
  TransferOwnershipRequest,
} from '../types/clubManagement';
import type { BookClubRead } from '../types/bookClub';

// AC1: Update club details
export const updateClubDetails = async (clubId: number, data: BookClubUpdateRequest): Promise<BookClubRead> => {
  const response = await api.put<BookClubRead>(`/api/clubs/${clubId}`, data);
  return response.data;
};

// AC2: Get join requests
export const getJoinRequests = async (clubId: number): Promise<ClubJoinRequest[]> => {
  const response = await api.get<ClubJoinRequest[]>(`/api/clubs/${clubId}/join-requests`);
  return response.data;
};

// AC2: Approve a join request
export const approveJoinRequest = async (clubId: number, requestId: number): Promise<void> => {
  await api.post(`/api/clubs/${clubId}/join-requests/${requestId}/approve`);
};

// AC2: Reject a join request
export const rejectJoinRequest = async (clubId: number, requestId: number): Promise<void> => {
  await api.post(`/api/clubs/${clubId}/join-requests/${requestId}/reject`);
};

// AC3, AC4: Get club members
export const getClubMembers = async (clubId: number): Promise<ClubMember[]> => {
  const response = await api.get<ClubMember[]>(`/api/clubs/${clubId}/members`);
  return response.data;
};

// AC3: Update a member's role
export const updateMemberRole = async (clubId: number, userId: number, data: UpdateMemberRoleRequest): Promise<ClubMember> => {
  const response = await api.put<ClubMember>(`/api/clubs/${clubId}/members/${userId}/role`, data);
  return response.data;
};

// AC4: Remove a member
export const removeMember = async (clubId: number, userId: number): Promise<void> => {
  await api.delete(`/api/clubs/${clubId}/members/${userId}`);
};

// AC5: Transfer ownership
export const transferOwnership = async (clubId: number, data: TransferOwnershipRequest): Promise<void> => {
  await api.post(`/api/clubs/${clubId}/transfer-ownership`, data);
};
