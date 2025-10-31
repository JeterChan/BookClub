// frontend/src/services/bookClubService.ts
import api from './apiClient';
import type { 
  BookClubCreateRequest, 
  BookClubRead, 
  ClubTag, 
  PaginatedBookClubList 
} from '../types/bookClub';
import type { DiscussionTopic, DiscussionComment } from '../types/discussion';

/**
 * 建立新的讀書會
 */
export const createBookClub = async (data: BookClubCreateRequest): Promise<BookClubRead> => {
  const response = await api.post<BookClubRead>('/api/v1/clubs', data);
  return response.data;
};

/**
 * 取得所有可用的標籤
 */
export const getAvailableTags = async (): Promise<ClubTag[]> => {
  const response = await api.get<ClubTag[]>('/api/v1/clubs/tags');
  return response.data;
};

/**
 * 列出所有公開的讀書會
 */
export const listBookClubs = async (params?: {
  page?: number;
  pageSize?: number;
  keyword?: string;
  tagIds?: number[];
}): Promise<PaginatedBookClubList> => {
  const queryParams = new URLSearchParams();
  
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.pageSize) queryParams.append('page_size', params.pageSize.toString());
  if (params?.keyword) queryParams.append('keyword', params.keyword);
  if (params?.tagIds && params.tagIds.length > 0) {
    queryParams.append('tag_ids', params.tagIds.join(','));
  }
  
  const response = await api.get<PaginatedBookClubList>(
    `/api/v1/clubs${queryParams.toString() ? '?' + queryParams.toString() : ''}`
  );
  return response.data;
};

/**
 * 根據 ID 獲取讀書會詳細資訊
 */
export const getBookClubById = async (clubId: number): Promise<BookClubRead> => {
  const response = await api.get<BookClubRead>(`/api/v1/clubs/${clubId}`);
  return response.data;
};

/**
 * 加入讀書會
 */
export const joinClub = async (clubId: number): Promise<void> => {
  await api.post(`/api/v1/clubs/${clubId}/join`, {});
};

/**
 * 退出讀書會
 */
export const leaveClub = async (clubId: number): Promise<void> => {
  await api.delete(`/api/v1/clubs/${clubId}/leave`);
};

/**
 * 請求加入私密讀書會
 */
export const requestToJoinClub = async (clubId: number): Promise<void> => {
  await api.post(`/api/v1/clubs/${clubId}/request-join`);
};

// Discussions

export const getDiscussions = async (clubId: number): Promise<DiscussionTopic[]> => {
  const response = await api.get(`/api/v1/clubs/${clubId}/discussions`);
  return response.data;
};

export const createDiscussion = async (clubId: number, data: { title: string; content: string }): Promise<DiscussionTopic> => {
  const response = await api.post(`/api/v1/clubs/${clubId}/discussions`, data);
  return response.data;
};

export const getDiscussion = async (clubId: number, topicId: number): Promise<DiscussionTopic> => {
  const response = await api.get(`/api/v1/clubs/${clubId}/discussions/${topicId}`);
  return response.data;
};

export const createComment = async (clubId: number, topicId: number, data: { content: string }): Promise<DiscussionComment> => {
  const response = await api.post(`/api/v1/clubs/${clubId}/discussions/${topicId}/comments`, data);
  return response.data;
};

export default {
  createBookClub,
  getAvailableTags,
  listBookClubs,
  getBookClubById,
  joinClub,
  leaveClub,
  requestToJoinClub,
};
