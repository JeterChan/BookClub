import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Login from '../../../pages/Login';
import { authService } from '../../../services/authService';
import { useAuthStore } from '../../../store/authStore';

// Mock modules
vi.mock('../../../services/authService');
vi.mock('../../../store/authStore');

// Mock navigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('Login Page', () => {
  const mockLoginStore = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock store implementation
    (useAuthStore as any).mockImplementation((selector: any) => {
      if (typeof selector === 'function') {
        return selector({ login: mockLoginStore });
      }
      return { login: mockLoginStore };
    });
  });

  it('renders login form correctly', () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: /歡迎回來/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^密碼$/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /登入/i })).toBeInTheDocument();
  });

  it('shows validation errors for empty inputs', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    const submitButton = screen.getByRole('button', { name: /登入/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/請輸入有效的 Email 地址/i)).toBeInTheDocument();
      expect(screen.getByText(/請輸入密碼/i)).toBeInTheDocument();
    });
  });

  it('calls login service and redirects on success', async () => {
    const user = userEvent.setup();
    // Setup success response
    (authService.login as any).mockResolvedValue({
      access_token: 'fake-token',
      token_type: 'bearer'
    });

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    // Fill form
    await user.type(screen.getByLabelText(/Email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/^密碼$/), 'password123');
    
    // Submit
    await user.click(screen.getByRole('button', { name: /登入/i }));

    await waitFor(() => {
      expect(authService.login).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      });
      expect(mockLoginStore).toHaveBeenCalledWith(
        expect.objectContaining({ access_token: 'fake-token' }), 
        false
      );
      expect(mockNavigate).toHaveBeenCalledWith('/welcome');
    });
  });

  it('displays error message on login failure', async () => {
    const user = userEvent.setup();
    // Setup failure response
    (authService.login as any).mockRejectedValue({
      response: {
        data: {
          detail: 'Incorrect email or password'
        }
      }
    });

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    await user.type(screen.getByLabelText(/Email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/^密碼$/), 'wrongpassword');
    await user.click(screen.getByRole('button', { name: /登入/i }));

    await waitFor(() => {
      expect(screen.getByText(/帳號或密碼錯誤/i)).toBeInTheDocument();
    });
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('handles unverified email specific error', async () => {
    const user = userEvent.setup();
    (authService.login as any).mockRejectedValue({
      response: {
        data: {
          detail: '請先完成 Email 驗證'
        }
      }
    });

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    await user.type(screen.getByLabelText(/Email/i), 'unverified@example.com');
    await user.type(screen.getByLabelText(/^密碼$/), 'password123');
    await user.click(screen.getByRole('button', { name: /登入/i }));

    await waitFor(() => {
      expect(screen.getByText(/您的 Email 尚未驗證/i)).toBeInTheDocument();
      expect(screen.getByText(/點此重新發送驗證信/i)).toBeInTheDocument();
    });
  });

  it('toggles password visibility', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    const passwordInput = screen.getByLabelText(/^密碼$/);
    expect(passwordInput).toHaveAttribute('type', 'password');

    const toggleBtn = screen.getByLabelText(/顯示密碼/i);
    await user.click(toggleBtn);

    expect(passwordInput).toHaveAttribute('type', 'text');
    expect(screen.getByLabelText(/隱藏密碼/i)).toBeInTheDocument();
  });
});
