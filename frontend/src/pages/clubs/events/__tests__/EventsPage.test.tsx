import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import EventsPage from '../EventsPage';
import { getEventsList, isEventPast } from '../../../../services/eventService';
import { useBookClubStore } from '../../../../store/bookClubStore';

// Mock services
vi.mock('../../../../services/eventService', () => ({
  getEventsList: vi.fn(),
  isEventPast: vi.fn(),
}));

// Mock store
vi.mock('../../../../store/bookClubStore');

// Mock EventCard to avoid testing child logic again
vi.mock('../../../../components/events/EventCard', () => ({
  EventCard: ({ event }: any) => <div data-testid="event-card">{event.title}</div>,
}));

describe('EventsPage', () => {
  const mockFetchClubDetail = vi.fn();
  const mockEvents = [
    { id: 1, title: 'Future Event', eventDatetime: '2025-12-01', clubId: 1 },
    { id: 2, title: 'Past Event', eventDatetime: '2020-01-01', clubId: 1 },
  ];

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default store behavior
    (useBookClubStore as any).mockReturnValue({
      detailClub: { id: 1, membership_status: 'member' },
      fetchClubDetail: mockFetchClubDetail,
    });

    // Setup default service behavior
    (getEventsList as any).mockResolvedValue({
      items: mockEvents,
      pagination: { totalPages: 1, page: 1 },
    });

    (isEventPast as any).mockImplementation((date: string) => date === '2020-01-01');
  });

  const renderPage = () => {
    return render(
      <MemoryRouter initialEntries={['/clubs/1/events']}>
        <Routes>
          <Route path="/clubs/:clubId/events" element={<EventsPage />} />
        </Routes>
      </MemoryRouter>
    );
  };

  it('renders loading state initially', () => {
    // Make promise that doesn't resolve immediately
    (getEventsList as any).mockReturnValue(new Promise(() => {}));
    renderPage();
    // Check for loading spinner or indicator (implementation detail: check for "animate-spin" or structure)
    // The component renders a div with animate-spin class.
    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('fetches and categorizes events correctly', async () => {
    renderPage();

    await waitFor(() => {
      expect(getEventsList).toHaveBeenCalledWith(1, expect.objectContaining({ page: 1 }));
    });

    // Check headers
    expect(screen.getByText(/即將舉行/)).toBeInTheDocument();
    expect(screen.getByText(/已結束/)).toBeInTheDocument();

    // Check events rendering (via mocked EventCard)
    expect(screen.getByText('Future Event')).toBeInTheDocument();
    expect(screen.getByText('Past Event')).toBeInTheDocument();
  });

  it('shows empty state when no events', async () => {
    (getEventsList as any).mockResolvedValue({
      items: [],
      pagination: { totalPages: 1 },
    });

    renderPage();

    await waitFor(() => {
      expect(screen.getByText(/尚無活動/)).toBeInTheDocument();
    });
  });

  it('shows "Create Event" button for admin', async () => {
    (useBookClubStore as any).mockReturnValue({
      detailClub: { id: 1, membership_status: 'admin' },
      fetchClubDetail: mockFetchClubDetail,
    });

    renderPage();

    await waitFor(() => {
      // Should be visible in header
      expect(screen.getByRole('button', { name: /建立活動/i })).toBeInTheDocument();
    });
  });

  it('hides "Create Event" button for normal member', async () => {
    (useBookClubStore as any).mockReturnValue({
      detailClub: { id: 1, membership_status: 'member' },
      fetchClubDetail: mockFetchClubDetail,
    });

    renderPage();

    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /建立活動/i })).not.toBeInTheDocument();
    });
  });
});
