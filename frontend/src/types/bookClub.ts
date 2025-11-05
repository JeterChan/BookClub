// frontend/src/types/bookClub.ts

export type BookClubVisibility = 'public' | 'private';

export interface ClubTag {
  id: number;
  name: string;
  is_predefined: boolean;
}

export interface UserRead {
  id: number;
  email: string;
  display_name: string;
  avatar_url?: string;
}

// The full book club object returned from the API for the detail view
export interface BookClubRead {
  id: number;
  name: string;
  description: string | null;
  visibility: BookClubVisibility;
  cover_image_url: string | null;
  owner_id: number;
  created_at: string;
  updated_at: string;
  owner: UserRead;
  tags: ClubTag[];
  member_count: number;
  membership_status: 'owner' | 'admin' | 'member' | 'not_member' | 'pending_request' | null;
}

// The object used for the main club listing on the explore page
export interface BookClubListItem {
  id: number;
  name: string;
  description: string | null;
  visibility: BookClubVisibility;
  cover_image_url: string | null;
  created_at: string;
  updated_at: string;
  owner: UserRead;
  tags: ClubTag[];
  member_count: number;
  membership_status?: 'owner' | 'admin' | 'member' | 'not_member' | 'pending_request' | null;
}

// For creating a new book club
export interface BookClubCreateRequest {
  name: string;
  description?: string;
  visibility: BookClubVisibility;
  tag_ids: number[];
  cover_image?: File;
}

export interface PaginationMeta {
  page: number;
  page_size: number;
  total_items: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
}

export interface PaginatedBookClubList {
  items: BookClubListItem[];
  pagination: PaginationMeta;
}