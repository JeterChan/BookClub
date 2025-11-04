import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import Discussions from '../Discussions';
import { useBookClubStore } from '../../../store/bookClubStore';
import { vi } from 'vitest';

vi.mock('../../../store/bookClubStore');

describe('Discussions Page', () => {
  it('renders discussion topics', async () => {
    vi.mocked(useBookClubStore).mockReturnValue({
      discussions: [{ id: 1, title: 'Test Topic', content: 'Test Content', club_id: 1, owner_id: 1 }],
      loading: false,
      error: null,
      fetchDiscussions: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/clubs/1/discussions']}>
        <Routes>
          <Route path="/clubs/:clubId/discussions" element={<Discussions />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Discussions')).toBeInTheDocument();
    expect(screen.getByText('New Topic')).toBeInTheDocument();
    expect(await screen.findByText('Test Topic')).toBeInTheDocument();
  });
});