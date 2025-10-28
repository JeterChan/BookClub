// frontend/src/pages/clubs/__tests__/ClubSettings.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import ClubSettings from '../ClubSettings';
import { useBookClubStore } from '../../../store/bookClubStore';
import { useClubManagementStore } from '../../../store/clubManagementStore';

// Mock stores
vi.mock('../../../store/bookClubStore');
vi.mock('../../../store/clubManagementStore');

describe('ClubSettings Page', () => {
  const mockClub = {
    id: 1,
    name: 'Test Club',
  };

  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();
    (useClubManagementStore as vi.Mock).mockReturnValue({
      fetchClubManagementData: vi.fn(),
      deleteClub: vi.fn(),
      loading: false,
      error: null,
    });
  });

  it('should display delete button for owner', () => {
    (useBookClubStore as vi.Mock).mockReturnValue({ detailClub: { ...mockClub, membership_status: 'owner' } });

    render(
      <MemoryRouter>
        <ClubSettings />
      </MemoryRouter>
    );

    expect(screen.getByText('刪除讀書會')).toBeInTheDocument();
  });

  it('should not display delete button for admin', () => {
    (useBookClubStore as vi.Mock).mockReturnValue({ detailClub: { ...mockClub, membership_status: 'admin' } });

    render(
      <MemoryRouter>
        <ClubSettings />
      </MemoryRouter>
    );

    expect(screen.queryByText('刪除讀書會')).not.toBeInTheDocument();
  });

  it('should open confirmation modal on delete button click', () => {
    (useBookClubStore as vi.Mock).mockReturnValue({ detailClub: { ...mockClub, membership_status: 'owner' } });

    render(
      <MemoryRouter>
        <ClubSettings />
      </MemoryRouter>
    );

    const deleteButton = screen.getByText('刪除讀書會');
    fireEvent.click(deleteButton);

    expect(screen.getByText('確認刪除讀書會')).toBeInTheDocument();
    expect(screen.getByText(/你確定要永久刪除這個讀書會嗎/)).toBeInTheDocument();
  });
});
