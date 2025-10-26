import { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';
import { PrivateRoute } from './components/common/PrivateRoute';
import Layout from './components/common/Layout';

// Lazy load pages
const Register = lazy(() => import('./pages/Register'));
const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Profile = lazy(() => import('./pages/Profile'));
const VerifyEmail = lazy(() => import('./pages/VerifyEmail'));
const ClubCreate = lazy(() => import('./pages/clubs/ClubCreate'));
const ClubExplore = lazy(() => import('./pages/clubs/ClubExplore'));
const ClubDetail = lazy(() => import('./pages/clubs/ClubDetail'));
const ClubSettings = lazy(() => import('./pages/clubs/ClubSettings'));

// Loading component
const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
);

function App() {
  const initialize = useAuthStore((state) => state.initialize);

  // Initialize auth state on app mount
  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/" element={<Navigate to="/clubs" replace />} />
          <Route path="/register" element={<Layout><Register /></Layout>} />
          <Route path="/login" element={<Layout><Login /></Layout>} />
          <Route path="/verify-email" element={<Layout><VerifyEmail /></Layout>} />
          <Route 
            path="/dashboard" 
            element={
              <PrivateRoute>
                <Layout><Dashboard /></Layout>
              </PrivateRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <PrivateRoute>
                <Layout><Profile /></Layout>
              </PrivateRoute>
            } 
          />
          <Route 
            path="/clubs/create" 
            element={
              <PrivateRoute>
                <Layout><ClubCreate /></Layout>
              </PrivateRoute>
            } 
          />
          <Route path="/clubs" element={<Layout><ClubExplore /></Layout>} />
          <Route path="/clubs/:clubId" element={<Layout><ClubDetail /></Layout>} />
          <Route 
            path="/clubs/:clubId/settings" 
            element={
              <PrivateRoute>
                <Layout><ClubSettings /></Layout>
              </PrivateRoute>
            } 
          />
          {/* Placeholder for other routes */}
          <Route path="*" element={<Navigate to="/clubs" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
