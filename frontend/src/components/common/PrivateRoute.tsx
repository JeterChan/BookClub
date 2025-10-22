import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

interface PrivateRouteProps {
  children: ReactNode;
}

/**
 * PrivateRoute - Route protection component
 * Redirects unauthenticated users to /login
 * Used to protect authenticated-only pages like /dashboard
 */
export const PrivateRoute = ({ children }: PrivateRouteProps) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
