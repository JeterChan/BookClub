import { useAuthStore } from '../store/authStore';
import { useDashboard } from '../hooks/useDashboard';
import { UserInfoCard } from '../components/dashboard/UserInfoCard';
import { QuickActions } from '../components/dashboard/QuickActions';
import { MyClubsList } from '../components/dashboard/MyClubsList';
import { RecentEvents } from '../components/dashboard/RecentEvents';
import { SkeletonCard, SkeletonCircle } from '../components/common/SkeletonCard';

/**
 * Dashboard - Main dashboard page
 * Shows user info, their clubs, and recent activity in a two-column layout.
 * Requires authentication.
 */
const Dashboard = () => {
  const { user, isInitializing: isUserInitializing } = useAuthStore();
  const { dashboard, loading: isDashboardLoading, error } = useDashboard();

  // Loading state - show skeletons
  if (isUserInitializing || isDashboardLoading || !user || !dashboard) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-8" data-testid="dashboard-skeleton">
        <div className="max-w-7xl mx-auto flex gap-8">
          {/* Main content skeleton */}
          <div className="flex-grow space-y-6">
            <SkeletonCard />
            <SkeletonCard />
          </div>
          {/* Sidebar skeleton */}
          <div className="w-full max-w-sm flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex flex-col items-center gap-4">
                <SkeletonCircle size="xl" />
                <div className="flex-1 space-y-3 w-full">
                  <div className="h-8 bg-gray-200 rounded w-2/3 mx-auto animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/3 mx-auto animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center text-red-500">
          <p>Error loading dashboard data: {error.message}</p>
        </div>
      </div>
    );
  }

  // Success state - render dashboard
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">個人儀表板</h1>
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content (Left Column) */}
          <main className="flex-grow space-y-6">
            <QuickActions />
            <MyClubsList clubs={dashboard.clubs} />
            <RecentEvents />
          </main>
          
          {/* Sidebar (Right Column) */}
          <aside className="w-full lg:w-80 lg:flex-shrink-0">
            <UserInfoCard user={user} />
          </aside>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
