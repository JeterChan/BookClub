// frontend/src/services/eventService.ts
import api from './apiClient';

/**
 * 活動狀態類型
 */
export type EventStatus = 'draft' | 'published' | 'completed' | 'cancelled';

/**
 * 建立活動請求介面
 */
export interface EventCreateRequest {
  title: string;
  description: string;
  eventDatetime: string; // ISO 8601 格式
  meetingUrl: string;
  maxParticipants?: number | null;
  status: EventStatus;
}

/**
 * 活動回應介面
 */
export interface EventResponse {
  id: number;
  clubId: number;
  title: string;
  description: string;
  eventDatetime: string;
  meetingUrl: string;
  organizerId: number;
  maxParticipants: number | null;
  status: EventStatus;
  createdAt: string;
  updatedAt: string;
  participantCount: number;
}

/**
 * 發起人資訊介面
 */
export interface OrganizerInfo {
  id: number;
  displayName: string;
  avatarUrl: string | null;
}

/**
 * 活動列表項目介面
 */
export interface EventListItem {
  id: number;
  clubId: number;
  title: string;
  eventDatetime: string;
  currentParticipants: number;
  maxParticipants: number | null;
  status: EventStatus;
  organizer: OrganizerInfo;
  isOrganizer: boolean;
  isParticipating: boolean;
  createdAt: string;
}

/**
 * 活動詳細資訊介面
 */
export interface EventDetail {
  id: number;
  clubId: number;
  title: string;
  description: string;
  eventDatetime: string;
  meetingUrl: string;
  currentParticipants: number;
  maxParticipants: number | null;
  status: EventStatus;
  organizer: OrganizerInfo;
  isOrganizer: boolean;
  isParticipating: boolean;
  createdAt: string;
}

/**
 * 分頁元資料介面
 */
export interface PaginationMetadata {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

/**
 * 活動列表回應介面
 */
export interface EventListResponse {
  items: EventListItem[];
  pagination: PaginationMetadata;
}

/**
 * 活動列表查詢參數介面
 */
export interface EventListParams {
  status?: EventStatus;
  page?: number;
  pageSize?: number;
  sortBy?: 'event_datetime' | 'created_at';
  order?: 'asc' | 'desc';
}

/**
 * 建立讀書會活動
 * @param clubId 讀書會 ID
 * @param data 活動資料
 * @returns 建立的活動資料
 */
export const createEvent = async (
  clubId: number,
  data: EventCreateRequest
): Promise<EventResponse> => {
  try {
    const response = await api.post<EventResponse>(
      `/api/v1/clubs/${clubId}/events`,
      data
    );
    return response.data;
  } catch (error: any) {
    // 處理特定錯誤
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 400:
          throw new Error(data.detail || '活動資料格式錯誤');
        case 403:
          throw new Error('您不是此讀書會成員，無法建立活動');
        case 404:
          throw new Error('找不到指定的讀書會');
        default:
          throw new Error(data.detail || '建立活動時發生錯誤');
      }
    }
    
    throw new Error('網路連線錯誤，請稍後再試');
  }
};

/**
 * 驗證會議 URL 格式
 * @param url 會議連結
 * @returns 是否為有效 URL
 */
export const validateMeetingUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'https:';
  } catch {
    return false;
  }
};

/**
 * 驗證活動時間是否為未來時間
 * @param datetime ISO 8601 格式的時間字串
 * @returns 是否為未來時間
 */
export const validateEventDatetime = (datetime: string): boolean => {
  const eventTime = new Date(datetime);
  const now = new Date();
  return eventTime > now;
};

/**
 * 查詢讀書會活動列表
 * @param clubId 讀書會 ID
 * @param params 查詢參數
 * @returns 活動列表與分頁資訊
 */
export const getEventsList = async (
  clubId: number,
  params?: EventListParams
): Promise<EventListResponse> => {
  try {
    // 建構查詢參數
    const queryParams = new URLSearchParams();
    
    if (params?.status) {
      queryParams.append('status', params.status);
    }
    if (params?.page) {
      queryParams.append('page', params.page.toString());
    }
    if (params?.pageSize) {
      queryParams.append('page_size', params.pageSize.toString());
    }
    if (params?.sortBy) {
      queryParams.append('sort_by', params.sortBy);
    }
    if (params?.order) {
      queryParams.append('order', params.order);
    }
    
    const queryString = queryParams.toString();
    const url = `/api/v1/clubs/${clubId}/events${queryString ? `?${queryString}` : ''}`;
    
    const response = await api.get<EventListResponse>(url);
    return response.data;
  } catch (error: any) {
    // 處理特定錯誤
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 403:
          throw new Error('您不是此讀書會成員，無法查看活動列表');
        case 404:
          throw new Error('找不到指定的讀書會');
        default:
          throw new Error(data.detail || '查詢活動列表時發生錯誤');
      }
    }
    
    throw new Error('網路連線錯誤，請稍後再試');
  }
};

/**
 * 判斷活動是否已經開始或結束
 * @param eventDatetime 活動時間
 * @returns true 表示已結束，false 表示即將舉行
 */
export const isEventPast = (eventDatetime: string): boolean => {
  const eventTime = new Date(eventDatetime);
  const now = new Date();
  return eventTime < now;
};

/**
 * 取得活動詳細資訊
 * @param clubId 讀書會 ID
 * @param eventId 活動 ID
 * @returns 活動詳細資料
 */
export const getEventDetail = async (
  clubId: number,
  eventId: number
): Promise<EventDetail> => {
  try {
    const response = await api.get(`/api/v1/clubs/${clubId}/events/${eventId}`);
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      const data = error.response.data;
      switch (error.response.status) {
        case 403:
          throw new Error(data.detail || '您不是此讀書會成員');
        case 404:
          throw new Error(data.detail || '活動不存在');
        default:
          throw new Error(data.detail || '取得活動詳情時發生錯誤');
      }
    }
    
    throw new Error('網路連線錯誤，請稍後再試');
  }
};

/**
 * 加入活動
 * @param clubId 讀書會 ID
 * @param eventId 活動 ID
 * @returns 更新後的活動資料
 */
export const joinEvent = async (
  clubId: number,
  eventId: number
): Promise<EventDetail> => {
  try {
    const response = await api.post(`/api/v1/clubs/${clubId}/events/${eventId}/join`);
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      const data = error.response.data;
      switch (error.response.status) {
        case 400:
          throw new Error(data.detail || '無法加入活動');
        case 403:
          throw new Error(data.detail || '您不是此讀書會成員');
        case 404:
          throw new Error(data.detail || '活動不存在');
        default:
          throw new Error(data.detail || '加入活動時發生錯誤');
      }
    }
    
    throw new Error('網路連線錯誤，請稍後再試');
  }
};

/**
 * 退出活動
 * @param clubId 讀書會 ID
 * @param eventId 活動 ID
 * @returns 更新後的活動資料
 */
export const leaveEvent = async (
  clubId: number,
  eventId: number
): Promise<EventDetail> => {
  try {
    const response = await api.post(`/api/v1/clubs/${clubId}/events/${eventId}/leave`);
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      const data = error.response.data;
      switch (error.response.status) {
        case 400:
          throw new Error(data.detail || '無法退出活動');
        case 403:
          throw new Error(data.detail || '您不是此讀書會成員');
        case 404:
          throw new Error(data.detail || '活動不存在');
        default:
          throw new Error(data.detail || '退出活動時發生錯誤');
      }
    }
    
    throw new Error('網路連線錯誤，請稍後再試');
  }
};
