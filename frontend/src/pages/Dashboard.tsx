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
            {/* 統計卡片 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* 參加的社團數 */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-gray-900">{dashboard.stats.clubsCount}</div>
                    <div className="text-sm text-gray-600">參加社團</div>
                  </div>
                </div>
              </div>

              {/* 總留言數 */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-gray-900">{dashboard.stats.discussionsCount}</div>
                    <div className="text-sm text-gray-600">總留言數</div>
                  </div>
                </div>
              </div>

              {/* 本週活動 */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-gray-900">{dashboard.stats.weeklyEvents}</div>
                    <div className="text-sm text-gray-600">本週活動</div>
                  </div>
                </div>
              </div>
            </div>

            <MyClubsList clubs={dashboard.clubs} />
            <RecentEvents />
          </main>
          
          {/* Sidebar (Right Column) */}
          <aside className="w-full lg:w-80 lg:flex-shrink-0 space-y-4">
            <UserInfoCard user={user} />
            <QuickActions />
          </aside>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
