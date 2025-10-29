import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';

// Pages
import Mainpage from './pages/mainpage';
import Dashboard from './pages/dashboard';
import Account from './pages/account';
import ClubDirectory from './pages/club';
import ClubDetail from './pages/club/Detail';
import ClubCreate from './pages/club/Create';
import Discussions from './pages/discussions';
import DiscussionDetail from './pages/discussions/Detail';
import DiscussionNew from './pages/discussions/New';

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore();
  
  if (!user) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
}

function App() {
  const initialize = useAuthStore((state) => state.initialize);
  const syncFromStorage = useAuthStore((state) => state.syncFromStorage);
  const isInitializing = useAuthStore((state) => state.isInitializing);

  // 初始化認證狀態（從 localStorage/sessionStorage 恢復）
  useEffect(() => {
    initialize();
  }, [initialize]);

  // 監聽 storage 事件以同步不同分頁的登入狀態
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      // 當 access_token 改變時，同步狀態
      if (e.key === 'access_token' || e.key === null) {
        syncFromStorage();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [syncFromStorage]);

  // 顯示載入畫面直到初始化完成
  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-[#04c0f4]/5 to-[#04c0f4]/10">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#04c0f4] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">載入中...</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Mainpage />} />
        
        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/account"
          element={
            <ProtectedRoute>
              <Account />
            </ProtectedRoute>
          }
        />
        
        {/* Club Routes */}
        <Route path="/clubs" element={<ClubDirectory />} />
        <Route path="/clubs/:id" element={<ClubDetail />} />
        <Route
          path="/clubs/create"
          element={
            <ProtectedRoute>
              <ClubCreate />
            </ProtectedRoute>
          }
        />
        
        {/* Discussion Routes */}
        <Route path="/discussions" element={<Discussions />} />
        <Route path="/discussions/:id" element={<DiscussionDetail />} />
        <Route
          path="/discussions/new"
          element={
            <ProtectedRoute>
              <DiscussionNew />
            </ProtectedRoute>
          }
        />
        
        {/* 404 Not Found */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
