import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import DiscussionDetail from '../DiscussionDetail';
import { useBookClubStore } from '../../../store/bookClubStore';
import { vi } from 'vitest';

vi.mock('../../../store/bookClubStore');

describe('DiscussionDetail Page', () => {
  it('renders discussion topic and comments', async () => {
    vi.mocked(useBookClubStore).mockReturnValue({
      currentTopic: {
        id: 1,
        title: 'Test Topic',
        content: 'Test Content',
        club_id: 1,
        owner_id: 1,
        comments: [{ id: 1, content: 'Test Comment', owner_id: 1 }],
      },
      loading: false,
      error: null,
      fetchDiscussion: vi.fn(),
      addComment: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/clubs/1/discussions/1']}>
        <Routes>
          <Route path="/clubs/:clubId/discussions/:topicId" element={<DiscussionDetail />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Test Topic')).toBeInTheDocument();
    expect(await screen.findByText('Test Content')).toBeInTheDocument();
    expect(await screen.findByText('Test Comment')).toBeInTheDocument();
  });
});