import type { User } from '../types/auth';
import { apiClient } from './api';

// Dashboard data types
export interface DashboardStats {
  clubsCount: number;
  booksRead: number;
  discussionsCount: number;
}

export interface Club {
  id: number;
  name: string;
  coverImage: string | null;
  memberCount: number;
  lastActivity: string;
}

export interface Activity {
  id: number;
  type: 'join_club' | 'post_discussion' | 'complete_book' | 'comment';
  description: string;
  timestamp: string;
  relatedEntity?: {
    id: number;
    name: string;
    link: string;
  };
}

export interface DashboardData {
  stats: DashboardStats;
  clubs: Club[];
  recentActivities: Activity[];
}

// Mock data for development (if backend API not ready)
const mockDashboardData: DashboardData = {
  stats: {
    clubsCount: 3,
    booksRead: 12,
    discussionsCount: 48,
  },
  clubs: [
    {
      id: 1,
      name: '科幻小說愛好者',
      coverImage: null,
      memberCount: 24,
      lastActivity: '2025-10-20T10:30:00Z',
    },
    {
      id: 2,
      name: '推理懸疑讀書會',
      coverImage: null,
      memberCount: 18,
      lastActivity: '2025-10-19T15:45:00Z',
    },
    {
      id: 3,
      name: '歷史文學交流',
      coverImage: null,
      memberCount: 32,
      lastActivity: '2025-10-18T09:20:00Z',
    },
  ],
  recentActivities: [
    {
      id: 1,
      type: 'post_discussion',
      description: '在「三體」讀書會發表了新討論',
      timestamp: '2025-10-20T14:22:00Z',
      relatedEntity: {
        id: 1,
        name: '三體',
        link: '/clubs/1',
      },
    },
    {
      id: 2,
      type: 'complete_book',
      description: '完成閱讀《銀河便車指南》',
      timestamp: '2025-10-19T18:15:00Z',
    },
    {
      id: 3,
      type: 'comment',
      description: '在討論串中發表了評論',
      timestamp: '2025-10-19T10:30:00Z',
    },
    {
      id: 4,
      type: 'join_club',
      description: '加入了「推理懸疑讀書會」',
      timestamp: '2025-10-18T16:45:00Z',
      relatedEntity: {
        id: 2,
        name: '推理懸疑讀書會',
        link: '/clubs/2',
      },
    },
    {
      id: 5,
      type: 'post_discussion',
      description: '發起了關於《東方快車謀殺案》的討論',
      timestamp: '2025-10-17T11:20:00Z',
    },
  ],
};

// Use mock data flag (set to false when backend API is ready)
const USE_MOCK_DATA = false;

export const dashboardService = {
  /**
   * Get dashboard data (stats, clubs, activities)
   * GET /api/users/me/dashboard
   */
  getDashboard: async (): Promise<DashboardData> => {
    if (USE_MOCK_DATA) {
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 500));
      return mockDashboardData;
    }

    const response = await apiClient.get<DashboardData>('/api/v1/users/me/dashboard');
    return response.data;
  },
};
