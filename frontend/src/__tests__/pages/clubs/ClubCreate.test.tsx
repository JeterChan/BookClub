// frontend/src/__tests__/pages/clubs/ClubCreate.test.tsx
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import ClubCreate from '../../../pages/clubs/ClubCreate';
import { useBookClubStore } from '../../../store/bookClubStore';

// Mock the store
vi.mock('../../../store/bookClubStore');

// Mock react-router-dom navigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('ClubCreate', () => {
  const mockCreateBookClub = vi.fn();
  const mockFetchAvailableTags = vi.fn();
  const mockResetCreateSuccess = vi.fn();
  const mockClearError = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useBookClubStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      createBookClub: mockCreateBookClub,
      fetchAvailableTags: mockFetchAvailableTags,
      availableTags: [
        { id: 1, name: '文學', is_predefined: true },
        { id: 2, name: '科技', is_predefined: true },
        { id: 3, name: '商業', is_predefined: true },
      ],
      loading: false,
      error: null,
      createSuccess: false,
      currentClub: null,
      resetCreateSuccess: mockResetCreateSuccess,
      clearError: mockClearError,
    });
  });

  const renderComponent = () => {
    return render(
      <BrowserRouter>
        <ClubCreate />
      </BrowserRouter>
    );
  };

  it('should render the create book club form', () => {
    renderComponent();

    expect(screen.getByRole('heading', { name: '建立讀書會' })).toBeInTheDocument();
    expect(screen.getByLabelText(/讀書會名稱/)).toBeInTheDocument();
    expect(screen.getByLabelText(/讀書會描述/)).toBeInTheDocument();
  });

  it('should fetch available tags on mount', () => {
    renderComponent();

    expect(mockFetchAvailableTags).toHaveBeenCalledTimes(1);
  });

  it('should display available tags', () => {
    renderComponent();

    expect(screen.getByText('文學')).toBeInTheDocument();
    expect(screen.getByText('科技')).toBeInTheDocument();
    expect(screen.getByText('商業')).toBeInTheDocument();
  });

  it('should validate required fields', async () => {
    const user = userEvent.setup();
    renderComponent();

    const submitButton = screen.getByRole('button', { name: '建立讀書會' });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('請輸入讀書會名稱')).toBeInTheDocument();
      expect(screen.getByText('請至少選擇一個標籤')).toBeInTheDocument();
    });

    expect(mockCreateBookClub).not.toHaveBeenCalled();
  });

  it('should validate name length (max 50 characters)', async () => {
    const user = userEvent.setup();
    renderComponent();

    const nameInput = screen.getByLabelText(/讀書會名稱/);
    await user.type(nameInput, 'a'.repeat(51));

    const submitButton = screen.getByRole('button', { name: '建立讀書會' });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('名稱最多 50 個字元')).toBeInTheDocument();
    });
  });

  it('should validate description length (max 500 characters)', async () => {
    const user = userEvent.setup();
    renderComponent();

    const descriptionInput = screen.getByLabelText(/讀書會描述/);
    await user.type(descriptionInput, 'a'.repeat(501));

    const submitButton = screen.getByRole('button', { name: '建立讀書會' });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('描述最多 500 個字元')).toBeInTheDocument();
    });
  });

  it('should allow tag selection and deselection', async () => {
    const user = userEvent.setup();
    renderComponent();

    const techTag = screen.getByText('科技');
    
    // Select tag
    await user.click(techTag);
    expect(techTag).toHaveClass('bg-blue-600', 'text-white');

    // Deselect tag
    await user.click(techTag);
    expect(techTag).toHaveClass('bg-gray-200', 'text-gray-700');
  });

  it('should submit form with valid data', async () => {
    const user = userEvent.setup();
    mockCreateBookClub.mockResolvedValue(undefined);
    renderComponent();

    // Fill form
    await user.type(screen.getByLabelText(/讀書會名稱/), 'Test Book Club');
    await user.type(screen.getByLabelText(/讀書會描述/), 'Test description');
    
    // Select tags
    await user.click(screen.getByText('文學'));
    await user.click(screen.getByText('科技'));

    // Submit
    const submitButton = screen.getByRole('button', { name: '建立讀書會' });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockCreateBookClub).toHaveBeenCalledWith({
        name: 'Test Book Club',
        description: 'Test description',
        visibility: 'public',
        tag_ids: [1, 2],
      });
    });
  });

  it('should navigate on cancel', async () => {
    const user = userEvent.setup();
    renderComponent();

    const cancelButton = screen.getByRole('button', { name: '取消' });
    await user.click(cancelButton);

    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  it('should disable buttons while loading', () => {
    (useBookClubStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      createBookClub: mockCreateBookClub,
      fetchAvailableTags: mockFetchAvailableTags,
      availableTags: [],
      loading: true,
      error: null,
      createSuccess: false,
      currentClub: null,
      resetCreateSuccess: mockResetCreateSuccess,
      clearError: mockClearError,
    });

    renderComponent();

    expect(screen.getByRole('button', { name: '建立中...' })).toBeDisabled();
    expect(screen.getByRole('button', { name: '取消' })).toBeDisabled();
  });
});
