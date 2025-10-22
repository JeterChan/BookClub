import { useDashboardData } from '../hooks/useDashboardData';
import { UserInfoCard } from '../components/dashboard/UserInfoCard';
import { StatsCard } from '../components/dashboard/StatsCard';
import { QuickActions } from '../components/dashboard/QuickActions';
import { MyClubsList } from '../components/dashboard/MyClubsList';
import { ActivityTimeline } from '../components/dashboard/ActivityTimeline';
import { SkeletonCard, SkeletonCircle } from '../components/common/SkeletonCard';
import { Button } from '../components/ui/Button';

/**
 * Dashboard - Main dashboard page
 * Shows user info, stats, quick actions, clubs, and activity timeline
 * Requires authentication (protected by PrivateRoute)
 */
const Dashboard = () => {
  const { user, dashboard, loading, error, refetch } = useDashboardData();

  // Loading state - show skeletons
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="space-y-6">
            {/* User info skeleton */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-start gap-4">
                <SkeletonCircle size="xl" />
                <div className="flex-1 space-y-3">
                  <div className="h-8 bg-gray-200 rounded w-1/3 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse"></div>
                </div>
              </div>
            </div>
            
            {/* Stats skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
            
            {/* Other sections */}
            <SkeletonCard />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SkeletonCard />
              <SkeletonCard />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !user || !dashboard) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 max-w-md text-center">
          <p className="text-5xl mb-4">⚠️</p>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">載入失敗</h2>
          <p className="text-gray-600 mb-4">
            {error?.message || '無法載入儀表板資料，請稍後再試'}
          </p>
          <Button onClick={refetch}>重新載入</Button>
        </div>
      </div>
    );
  }

  // Success state - render dashboard
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Page title */}
        <h1 className="text-3xl font-bold text-gray-900 mb-6">個人儀表板</h1>
        
        <div className="space-y-6">
          {/* User info */}
          <UserInfoCard user={user} />
          
          {/* Statistics */}
          <StatsCard stats={dashboard.stats} />
          
          {/* Quick actions */}
          <QuickActions />
          
          {/* Clubs and Activity - side by side on desktop */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <MyClubsList clubs={dashboard.clubs} />
            <ActivityTimeline activities={dashboard.recentActivities} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
