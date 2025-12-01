import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { EventCard } from '../EventCard';
import type { EventListItem } from '../../../services/eventService';

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock isEventPast
vi.mock('../../../services/eventService', () => ({
  isEventPast: vi.fn(),
}));

import { isEventPast } from '../../../services/eventService';

const mockEvent: EventListItem = {
  id: 1,
  clubId: 101,
  title: 'Test Event',
  eventDatetime: '2025-12-25T10:00:00Z',
  currentParticipants: 5,
  maxParticipants: 10,
  status: 'published',
  organizer: {
    id: 1,
    displayName: 'Organizer John',
    avatarUrl: null,
  },
  isOrganizer: false,
  isParticipating: false,
  createdAt: '2025-11-01T10:00:00Z',
};

describe('EventCard', () => {
  it('renders event details correctly', () => {
    (isEventPast as any).mockReturnValue(false);
    render(<EventCard event={mockEvent} />);

    expect(screen.getByText('Test Event')).toBeInTheDocument();
    expect(screen.getByText(/Organizer John/)).toBeInTheDocument();
    expect(screen.getByText('5/10')).toBeInTheDocument();
    // Date formatting test might be tricky depending on timezone, but we can check parts or use regex
    // Or just trust it renders *something* for date.
  });

  it('shows "Organizer" badge when user is organizer', () => {
    (isEventPast as any).mockReturnValue(false);
    render(<EventCard event={{ ...mockEvent, isOrganizer: true }} />);
    expect(screen.getByText('我是發起人')).toBeInTheDocument();
    expect(screen.getByText('(我)')).toBeInTheDocument();
  });

  it('shows "Participating" badge when user is participating', () => {
    (isEventPast as any).mockReturnValue(false);
    render(<EventCard event={{ ...mockEvent, isParticipating: true }} />);
    expect(screen.getByText('已報名')).toBeInTheDocument();
  });

  it('shows "Past" badge when event is past', () => {
    (isEventPast as any).mockReturnValue(true);
    render(<EventCard event={mockEvent} />);
    expect(screen.getByText('已結束')).toBeInTheDocument();
  });

  it('shows "Full" status when participants limit reached', () => {
    (isEventPast as any).mockReturnValue(false);
    render(<EventCard event={{ ...mockEvent, currentParticipants: 10, maxParticipants: 10 }} />);
    expect(screen.getByText(/已額滿/)).toBeInTheDocument();
  });

  it('handles no max participants (unlimited)', () => {
    (isEventPast as any).mockReturnValue(false);
    render(<EventCard event={{ ...mockEvent, maxParticipants: 0 }} />);
    expect(screen.getByText('5人已報名')).toBeInTheDocument();
  });

  it('navigates to detail page on click', () => {
    (isEventPast as any).mockReturnValue(false);
    render(<EventCard event={mockEvent} />);
    
    fireEvent.click(screen.getByText('Test Event'));
    expect(mockNavigate).toHaveBeenCalledWith('/clubs/101/events/1');
  });
});
