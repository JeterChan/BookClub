import { create } from 'zustand';
import type { Notification } from '../types/notification';
import { notificationService } from '../services/notificationService';

interface NotificationState {
  notifications: Notification[];
  loading: boolean;
  error: string | null;
  unreadCount: number;
  
  fetchNotifications: (isRead?: boolean, limit?: number) => Promise<void>;
  markAsRead: (id: number) => Promise<void>;
  getUnreadCount: () => number;
  clearError: () => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  loading: false,
  error: null,
  unreadCount: 0,

  fetchNotifications: async (isRead?: boolean, limit?: number) => {
    set({ loading: true, error: null });
    try {
      const notifications = await notificationService.getNotifications(isRead, limit);
      const unreadCount = notifications.filter(n => !n.is_read).length;
      set({ notifications, unreadCount, loading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.detail || '無法載入通知', 
        loading: false 
      });
    }
  },

  markAsRead: async (id: number) => {
    try {
      await notificationService.markAsRead(id);
      set((state) => ({
        notifications: state.notifications.map(n =>
          n.id === id ? { ...n, is_read: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1)
      }));
    } catch (error: any) {
      set({ 
        error: error.response?.data?.detail || '無法標記為已讀' 
      });
    }
  },

  getUnreadCount: () => {
    return get().unreadCount;
  },

  clearError: () => set({ error: null })
}));
