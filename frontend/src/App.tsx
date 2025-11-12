import { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';
import { PrivateRoute } from './components/common/PrivateRoute';
import Layout from './components/common/Layout';

// Lazy load pages
const LandingPage = lazy(() => import('./pages/LandingPage'));
const WelcomePage = lazy(() => import('./pages/WelcomePage'));
const Register = lazy(() => import('./pages/Register'));
const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Profile = lazy(() => import('./pages/Profile'));
const VerifyEmail = lazy(() => import('./pages/VerifyEmail'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const TermsOfService = lazy(() => import('./pages/legal/TermsOfService'));
const PrivacyPolicy = lazy(() => import('./pages/legal/PrivacyPolicy'));
const ClubCreate = lazy(() => import('./pages/clubs/ClubCreate'));
const ClubExplore = lazy(() => import('./pages/clubs/ClubExplore'));
const ClubDetail = lazy(() => import('./pages/clubs/ClubDetail'));
const ClubSettings = lazy(() => import('./pages/clubs/ClubSettings'));
const MyClubs = lazy(() => import('./pages/clubs/MyClubs'));
const Discussions = lazy(() => import('./pages/clubs/Discussions'));
const DiscussionNew = lazy(() => import('./pages/clubs/DiscussionNew'));
const DiscussionDetail = lazy(() => import('./pages/clubs/DiscussionDetail'));
const EventCreate = lazy(() => import('./pages/clubs/events/EventCreate'));
const EventEdit = lazy(() => import('./pages/clubs/events/EventEdit').then(m => ({ default: m.EventEdit })));
const EventsPage = lazy(() => import('./pages/clubs/events/EventsPage'));
const EventDetail = lazy(() => import('./pages/clubs/events/EventDetail').then(m => ({ default: m.EventDetail })));
const MyEvents = lazy(() => import('./pages/activities/MyEvents'));
const Notifications = lazy(() => import('./pages/Notifications'));

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
    const init = async () => {
      await initialize();
    };
    init();
  }, [initialize]);

  return (
    <BrowserRouter>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            iconTheme: {
              primary: '#10B981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#EF4444',
              secondary: '#fff',
            },
          },
        }}
      />
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/" element={<Layout><LandingPage /></Layout>} />
          <Route path="/register" element={<Layout><Register /></Layout>} />
          <Route path="/login" element={<Layout><Login /></Layout>} />
          <Route path="/verify-email" element={<Layout><VerifyEmail /></Layout>} />
          <Route path="/forgot-password" element={<Layout><ForgotPassword /></Layout>} />
          <Route path="/reset-password" element={<Layout><ResetPassword /></Layout>} />
          <Route path="/terms" element={<Layout><TermsOfService /></Layout>} />
          <Route path="/privacy" element={<Layout><PrivacyPolicy /></Layout>} />
          <Route 
            path="/welcome" 
            element={
              <PrivateRoute>
                <Layout><WelcomePage /></Layout>
              </PrivateRoute>
            } 
          />
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
          <Route 
            path="/clubs/my-clubs" 
            element={
              <PrivateRoute>
                <Layout><MyClubs /></Layout>
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
          <Route 
            path="/clubs/:clubId/discussions" 
            element={
              <PrivateRoute>
                <Layout><Discussions /></Layout>
              </PrivateRoute>
            } 
          />
          <Route 
            path="/clubs/:clubId/discussions/new" 
            element={
              <PrivateRoute>
                <Layout><DiscussionNew /></Layout>
              </PrivateRoute>
            } 
          />
          <Route 
            path="/clubs/:clubId/discussions/:topicId" 
            element={
              <PrivateRoute>
                <Layout><DiscussionDetail /></Layout>
              </PrivateRoute>
            } 
          />
          <Route 
            path="/clubs/:clubId/events/create" 
            element={
              <PrivateRoute>
                <Layout><EventCreate /></Layout>
              </PrivateRoute>
            } 
          />
          <Route 
            path="/clubs/:clubId/events/:eventId/edit" 
            element={
              <PrivateRoute>
                <Layout><EventEdit /></Layout>
              </PrivateRoute>
            } 
          />
          <Route 
            path="/clubs/:clubId/events/:eventId" 
            element={
              <PrivateRoute>
                <Layout><EventDetail /></Layout>
              </PrivateRoute>
            } 
          />
          <Route 
            path="/clubs/:clubId/events" 
            element={
              <PrivateRoute>
                <Layout><EventsPage /></Layout>
              </PrivateRoute>
            } 
          />
          <Route 
            path="/activities/my-events" 
            element={
              <PrivateRoute>
                <Layout><MyEvents /></Layout>
              </PrivateRoute>
            } 
          />
          <Route 
            path="/notifications" 
            element={
              <PrivateRoute>
                <Layout><Notifications /></Layout>
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
