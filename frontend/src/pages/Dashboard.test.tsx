import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Dashboard from './Dashboard';
import { useAuthStore } from '../store/authStore';
import { useDashboard } from '../hooks/useDashboard';

// Mock the stores and hooks
vi.mock('../store/authStore');
vi.mock('../hooks/useDashboard');

// Mock child components to simplify testing
vi.mock('../components/dashboard/UserInfoCard', () => ({
  UserInfoCard: () => <div data-testid="user-info-card">UserInfoCard</div>,
}));
vi.mock('../components/dashboard/QuickActions', () => ({
  QuickActions: () => <div data-testid="quick-actions">QuickActions</div>,
}));
vi.mock('../components/dashboard/MyClubsList', () => ({
  MyClubsList: () => <div data-testid="my-clubs-list">My Clubs List</div>,
}));
vi.mock('../components/dashboard/RecentEvents', () => ({
  RecentEvents: () => <div data-testid="recent-events">Recent Events</div>,
}));

describe('Dashboard Page', () => {
  const mockUser = {
    id: 1,
    email: 'test@example.com',
    display_name: 'Test User',
  };

  const mockDashboardData = {
    stats: {
      clubsCount: 5,
      discussionsCount: 10,
      weeklyEvents: 3,
    },
    clubs: [],
    recentEvents: [],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useAuthStore as any).mockReturnValue({
      user: mockUser,
      isInitializing: false,
    });
    (useDashboard as any).mockReturnValue({
      dashboard: mockDashboardData,
      loading: false,
      error: null,
    });
  });

  const renderWithRouter = (ui: React.ReactElement) => {
    return render(<MemoryRouter>{ui}</MemoryRouter>);
  };

  it('should render user information from the auth store', () => {
    renderWithRouter(<Dashboard />);
    expect(screen.getByTestId('user-info-card')).toBeInTheDocument();
  });

  it('should display a loading skeleton when initializing', () => {
    (useAuthStore as any).mockReturnValue({
      user: null,
      isInitializing: true,
    });
    renderWithRouter(<Dashboard />);
    expect(screen.getByTestId('dashboard-skeleton')).toBeInTheDocument();
  });

  it('should render the main content sections', () => {
    renderWithRouter(<Dashboard />);
    expect(screen.getByTestId('my-clubs-list')).toBeInTheDocument();
    expect(screen.getByTestId('recent-events')).toBeInTheDocument();
    expect(screen.getByTestId('quick-actions')).toBeInTheDocument();
  });
});
