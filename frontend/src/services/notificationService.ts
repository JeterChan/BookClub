import api from './apiClient';
import type { Notification } from '../types/notification';

export const notificationService = {
  /**
   * 獲取通知列表
   * @param isRead 篩選已讀/未讀通知（可選）
   * @param limit 限制返回數量，預設 20
   * @returns 通知列表
   */
  async getNotifications(isRead?: boolean, limit: number = 20): Promise<Notification[]> {
    const params = new URLSearchParams();
    if (isRead !== undefined) {
      params.append('is_read', String(isRead));
    }
    params.append('limit', String(limit));

    const response = await api.get(`/api/v1/notifications/?${params.toString()}`);
    return response.data;
  },

  /**
   * 標記通知為已讀
   * @param notificationId 通知 ID
   */
  async markAsRead(notificationId: number): Promise<void> {
    await api.post(`/api/v1/notifications/${notificationId}/read/`);
  }
};
