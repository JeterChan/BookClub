// frontend/src/pages/clubs/__tests__/ClubSettings.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { vi } from 'vitest';
import ClubSettings from '../ClubSettings';
import { useBookClubStore } from '../../../store/bookClubStore';
import { useClubManagementStore } from '../../../store/clubManagementStore';
import * as clubManagementService from '../../../services/clubManagementService';

// Mock the service layer
vi.mock('../../../services/clubManagementService');

// Mock the book club store as it's a dependency from another domain
vi.mock('../../../store/bookClubStore');


describe('ClubSettings Page', () => {
  const mockClub = {
    id: 1,
    name: 'Test Club',
  };

  const renderComponent = (membership_status = 'owner') => {
    // Mock the book club store to provide detailClub AND fetchClubDetail
    (useBookClubStore as any).mockReturnValue({ 
      detailClub: { ...mockClub, membership_status },
      fetchClubDetail: vi.fn(),
    });

    // Reset the state of the actual management store before each render
    useClubManagementStore.setState({ members: [], joinRequests: [], loading: false, error: null });

    return render(
      <MemoryRouter initialEntries={['/clubs/1/settings']}>
        <Routes>
          <Route path="/clubs/:clubId/settings" element={<ClubSettings />} />
        </Routes>
      </MemoryRouter>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock service implementations to return successful empty responses
    vi.mocked(clubManagementService.getClubMembers).mockResolvedValue([]);
    vi.mocked(clubManagementService.getJoinRequests).mockResolvedValue([]);
    vi.mocked(clubManagementService.deleteClub).mockResolvedValue(undefined);
  });

  it('should fetch data on mount and render tabs', async () => {
    renderComponent('owner');
    // Verify that the fetch function was called on mount
    await waitFor(() => {
        expect(clubManagementService.getClubMembers).toHaveBeenCalledWith(1);
        expect(clubManagementService.getJoinRequests).toHaveBeenCalledWith(1);
    });
    // Check if tabs are rendered
    expect(screen.getByRole('button', { name: /基本資訊/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /成員管理/i })).toBeInTheDocument();
  });

  it('should display settings tab for owner', async () => {
    renderComponent('owner');
    expect(await screen.findByRole('button', { name: /設定/i })).toBeInTheDocument();
  });

  it('should not display settings tab for non-owner (e.g., admin)', async () => {
    renderComponent('admin');
    // Wait for initial loading to be sure
    await waitFor(() => expect(clubManagementService.getClubMembers).toHaveBeenCalled());
    expect(screen.queryByRole('button', { name: /設定/i })).not.toBeInTheDocument();
  });

  it('should call deleteClub on confirmation in danger zone', async () => {
    renderComponent('owner');
    const settingsTab = await screen.findByRole('button', { name: /設定/i });
    fireEvent.click(settingsTab);

    const deleteButton = await screen.findByRole('button', { name: /刪除讀書會/i });
    fireEvent.click(deleteButton);

    // In the new implementation, ClubDangerZone has its own modal.
    // We need to find the confirm button in that modal and click it.
    const confirmButton = await screen.findByRole('button', { name: /確認/i });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(clubManagementService.deleteClub).toHaveBeenCalledWith(1);
    });
  });
});