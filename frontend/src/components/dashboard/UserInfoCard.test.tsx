import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { UserInfoCard } from './UserInfoCard';
import { MemoryRouter } from 'react-router-dom';

describe('UserInfoCard', () => {
  const mockUser = {
    id: 1,
    email: 'test@example.com',
    display_name: 'Test User',
    is_active: true,
    created_at: '2023-01-01',
    interest_tags: [],
  };

  it('should render user information correctly', () => {
    render(
      <MemoryRouter>
        <UserInfoCard user={mockUser} />
      </MemoryRouter>
    );
    
    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
    // Initials avatar (First letter of each word in display name)
    expect(screen.getByText('TU')).toBeInTheDocument();
  });

  it('should have a vertical layout', () => {
    const { container } = render(
      <MemoryRouter>
        <UserInfoCard user={mockUser} />
      </MemoryRouter>
    );
    
    // Check for flex-col class which indicates vertical layout
    // Note: This relies on implementation details (tailwind classes)
    // A more robust test might check computed styles but that can be tricky in jsdom
    const flexContainer = container.querySelector('.flex-col');
    expect(flexContainer).toBeInTheDocument();
  });
});