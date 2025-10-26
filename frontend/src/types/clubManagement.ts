// frontend/src/types/clubManagement.ts
import type { User } from './auth';

export type MemberRole = 'owner' | 'admin' | 'member';

export interface ClubMember {
  role: MemberRole;
  user: User;
}

export type JoinRequestStatus = 'pending' | 'approved' | 'rejected';

export interface ClubJoinRequest {
  id: number;
  user_id: number;
  book_club_id: number;
  status: JoinRequestStatus;
  created_at: string;
  user: User;
}

// API Request Body Types
export interface BookClubUpdateRequest {
  name?: string;
  description?: string;
  visibility?: 'public' | 'private';
  cover_image_url?: string;
}

export interface UpdateMemberRoleRequest {
  role: MemberRole;
}

export interface TransferOwnershipRequest {
  new_owner_id: number;
}
