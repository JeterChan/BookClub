import { useState, useEffect } from 'react';
import { dashboardService } from '../services/dashboardService';
import type { DashboardData } from '../services/dashboardService';
import type { User } from '../types/auth';

interface UseDashboardDataReturn {
  user: User | null;
  dashboard: DashboardData | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Custom hook for fetching dashboard data
 * Manages loading, error, and success states
 */
export const useDashboardData = (): UseDashboardDataReturn => {
  const [user, setUser] = useState<User | null>(null);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch user profile and dashboard data in parallel
      const [userProfile, dashboardData] = await Promise.all([
        dashboardService.getUserProfile(),
        dashboardService.getDashboard(),
      ]);

      setUser(userProfile);
      setDashboard(dashboardData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch dashboard data'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    user,
    dashboard,
    loading,
    error,
    refetch: fetchData,
  };
};
