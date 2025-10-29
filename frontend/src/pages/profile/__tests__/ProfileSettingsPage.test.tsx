import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import ProfileSettingsPage from '../ProfileSettingsPage';
import { profileService, UserProfile } from '../../../services/profileService';
import { useAuthStore } from '../../../store/authStore';
import { toast } from 'react-hot-toast';

// Mock services and stores
vi.mock('../../../services/profileService');
vi.mock('../../../store/authStore');

// Mock react-hot-toast
vi.mock('react-hot-toast', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    Toaster: () => <div data-testid="toaster" />,
    toast: {
      success: vi.fn(),
      error: vi.fn(),
    },
  };
});

const mockUser: UserProfile = {
  id: 1,
  email: 'test@example.com',
  display_name: 'Test User',
  bio: 'This is a test bio.',
  is_active: true,
  created_at: new Date().toISOString(),
  interest_tags: [],
  oauth_provider: null,
};

describe('ProfileSettingsPage', () => {
  const setUser = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuthStore).mockReturnValue({
      user: mockUser,
      setUser,
      // Mock other properties if needed by the component
      accessToken: 'test-token',
      isAuthenticated: true,
      isInitializing: false,
      login: vi.fn(),
      loginWithGoogle: vi.fn(),
      logout: vi.fn(),
      initialize: vi.fn(),
    });
    vi.mocked(profileService.getProfile).mockResolvedValue(mockUser);
    vi.mocked(profileService.updateProfile).mockImplementation(async (data) => {
      return { ...mockUser, ...data };
    });
  });

  it('AC2: should fetch and display existing profile data', async () => {
    render(<ProfileSettingsPage />);

    await waitFor(() => {
      expect(screen.getByLabelText(/顯示名稱/i)).toHaveValue(mockUser.display_name);
      expect(screen.getByLabelText(/個人簡介/i)).toHaveValue(mockUser.bio);
    });
  });

  it('AC3, AC5: should enable save button on change and update profile on submit', async () => {
    render(<ProfileSettingsPage />);

    await waitFor(() => expect(screen.getByLabelText(/顯示名稱/i)).toBeInTheDocument());

    const saveButton = screen.getByRole('button', { name: /儲存變更/i });
    expect(saveButton).toBeDisabled();

    // Change form data
    fireEvent.change(screen.getByLabelText(/顯示名稱/i), { target: { value: 'New Name' } });
    expect(saveButton).toBeEnabled();

    // Submit form
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(profileService.updateProfile).toHaveBeenCalledWith({ display_name: 'New Name', bio: mockUser.bio });
      expect(setUser).toHaveBeenCalledWith(expect.objectContaining({ display_name: 'New Name' }));
      expect(toast.success).toHaveBeenCalledWith('個人資料已成功更新！');
    });

    // Button should be disabled again after successful save
    expect(saveButton).toBeDisabled();
  });

  it('AC6: should show an error toast if update fails', async () => {
    vi.mocked(profileService.updateProfile).mockRejectedValue(new Error('Update failed'));
    render(<ProfileSettingsPage />);

    await waitFor(() => expect(screen.getByLabelText(/顯示名稱/i)).toBeInTheDocument());

    fireEvent.change(screen.getByLabelText(/顯示名稱/i), { target: { value: 'New Name' } });
    fireEvent.click(screen.getByRole('button', { name: /儲存變更/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('更新失敗，請稍後再試。');
    });
  });
});
