import { render, screen } from '@testing-library/react';
import { UserInfoCard } from './UserInfoCard';
import type { User } from '../../types/auth';

describe('UserInfoCard', () => {
  const mockUser: User = {
    id: 1,
    display_name: 'Test User',
    email: 'test@example.com',
    created_at: '2025-10-28T12:00:00Z',
    is_active: true,
  };

  it('should render user information correctly', () => {
    render(<UserInfoCard user={mockUser} />);

    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
    expect(screen.getByText(/加入於/)).toBeInTheDocument();
  });

  it('should have a vertical layout', () => {
    const { container } = render(<UserInfoCard user={mockUser} />);
    const flexContainer = container.firstChild?.firstChild;

    expect(flexContainer).toHaveClass('flex-col');
  });
});
