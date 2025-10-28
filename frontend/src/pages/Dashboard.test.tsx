import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useDashboard } from '../hooks/useDashboard';
import Dashboard from './Dashboard';
import { vi } from 'vitest';
import type { User } from '../types/auth';

// Mock the stores and hooks
vi.mock('../store/authStore');
vi.mock('../hooks/useDashboard');

// Mock child components
vi.mock('../components/dashboard/UserInfoCard', () => ({ 
  UserInfoCard: ({ user }: { user: User }) => (
    <div>
      <h2>{user.display_name}</h2>
      <p>{user.email}</p>
    </div>
  )
}));
vi.mock('../components/dashboard/MyClubsList', () => ({ MyClubsList: () => <div>My Clubs</div> }));
vi.mock('../components/dashboard/ActivityTimeline', () => ({ ActivityTimeline: () => <div>Activity Timeline</div> }));

describe('Dashboard Page', () => {
  const mockUser: User = {
    id: 1,
    display_name: 'Test User',
    email: 'test@example.com',
    created_at: new Date().toISOString(),
    is_active: true,
    bio: 'test bio',
    avatar_url: ''
  };

  const mockDashboardData = {
    stats: { clubsCount: 0, booksRead: 0, discussionsCount: 0 },
    clubs: [],
    recentActivities: [],
  };

  beforeEach(() => {
    (useAuthStore as unknown as vi.Mock).mockReturnValue({
      user: mockUser,
      isInitializing: false,
    });
    (useDashboard as unknown as vi.Mock).mockReturnValue({
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
    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
  });

  it('should display a loading skeleton when initializing', () => {
    (useAuthStore as unknown as vi.Mock).mockReturnValue({
      user: null,
      isInitializing: true,
    });
    (useDashboard as unknown as vi.Mock).mockReturnValue({
      dashboard: null,
      loading: true,
      error: null,
    });

    renderWithRouter(<Dashboard />);
    expect(screen.getByTestId('dashboard-skeleton')).toBeInTheDocument();
  });

  it('should render the main content sections', () => {
    renderWithRouter(<Dashboard />);
    expect(screen.getByText('My Clubs')).toBeInTheDocument();
    expect(screen.getByText('Activity Timeline')).toBeInTheDocument();
  });
});
