// frontend/src/hooks/useDashboard.ts
import { useState, useEffect, useRef } from 'react';
import { dashboardService } from '../services/dashboardService';
import type { DashboardData } from '../services/dashboardService';

interface UseDashboardReturn {
  dashboard: DashboardData | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Custom hook for fetching dashboard data (clubs, activities, etc.)
 * Manages loading, error, and success states.
 */
export const useDashboard = (): UseDashboardReturn => {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const hasFetched = useRef(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const dashboardData = await dashboardService.getDashboard();
      setDashboard(dashboardData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch dashboard data'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!hasFetched.current) {
      fetchData();
      hasFetched.current = true;
    }
  }, []);

  return {
    dashboard,
    loading,
    error,
    refetch: fetchData,
  };
};
