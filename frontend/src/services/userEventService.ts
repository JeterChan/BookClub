import api from './apiClient';

/**
 * 讀書會活動介面（含讀書會資訊）
 */
export interface ClubEvent {
  id: number;
  title: string;
  description: string;
  eventDatetime: string;
  meetingUrl: string;
  clubId: number;
  clubName: string;
  clubCoverImageUrl: string | null;
  status: 'published' | 'completed' | 'cancelled';
  isRegistered: boolean;
  isOrganizer: boolean;
  currentParticipants: number;
  maxParticipants: number | null;
  createdAt: string;
}

/**
 * 分頁資訊介面
 */
export interface PaginationInfo {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

/**
 * 分頁活動列表介面
 */
export interface PaginatedClubEvents {
  items: ClubEvent[];
  pagination: PaginationInfo;
}

/**
 * 獲取使用者活動查詢參數介面
 */
export interface GetUserEventsParams {
  page?: number;
  pageSize?: number;
  status?: 'published' | 'completed' | 'cancelled';
  participation?: 'all' | 'registered' | 'not_registered';
  clubId?: number;
}

/**
 * 獲取使用者參與讀書會的活動
 */
export const getUserClubEvents = async (
  params?: GetUserEventsParams
): Promise<PaginatedClubEvents> => {
  const queryParams = new URLSearchParams();
  
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.pageSize) queryParams.append('page_size', params.pageSize.toString());
  if (params?.status) queryParams.append('status', params.status);
  if (params?.participation) queryParams.append('participation', params.participation);
  if (params?.clubId) queryParams.append('club_id', params.clubId.toString());
  
  const response = await api.get<PaginatedClubEvents>(
    `/api/v1/users/me/events${queryParams.toString() ? '?' + queryParams.toString() : ''}`
  );
  
  return response.data;
};

export default {
  getUserClubEvents,
};
