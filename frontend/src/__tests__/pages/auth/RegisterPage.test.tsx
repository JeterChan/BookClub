import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Register from '../../../pages/Register';
import { authService } from '../../../services/authService';
import toast from 'react-hot-toast';

// Mock dependencies
vi.mock('../../../services/authService');

// Mock navigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('Register Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders registration form correctly', () => {
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: /建立帳號/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/顯示名稱/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^密碼/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/確認密碼/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /註冊/i })).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    const submitButton = screen.getByRole('button', { name: /註冊/i });
    await user.click(submitButton);

    await waitFor(() => {
      // Zod schema validation messages
      expect(screen.getByText(/顯示名稱至少 2 個字元/i)).toBeInTheDocument();
      expect(screen.getByText(/請輸入有效的 Email 地址/i)).toBeInTheDocument();
      expect(screen.getByText(/密碼至少 8 個字元/i)).toBeInTheDocument();
      expect(screen.getByText(/請同意服務條款/i)).toBeInTheDocument();
    });
  });

  it('validates password match', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    await user.type(screen.getByLabelText(/顯示名稱/i), 'TestUser');
    await user.type(screen.getByLabelText(/Email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/^密碼/i), 'Password123');
    await user.type(screen.getByLabelText(/確認密碼/i), 'Password456');
    
    const submitButton = screen.getByRole('button', { name: /註冊/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/密碼不一致/i)).toBeInTheDocument();
    });
  });

  it('calls register service and shows success message', async () => {
    const user = userEvent.setup();
    (authService.register as any).mockResolvedValue({
      message: 'User registered successfully'
    });

    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    await user.type(screen.getByLabelText(/顯示名稱/i), 'TestUser');
    await user.type(screen.getByLabelText(/Email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/^密碼/i), 'Password123');
    await user.type(screen.getByLabelText(/確認密碼/i), 'Password123');
    await user.click(screen.getByRole('checkbox', { name: /我同意/i }));
    
    const submitButton = screen.getByRole('button', { name: /註冊/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(authService.register).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'Password123',
        display_name: 'TestUser'
      });
      expect(screen.getByText(/註冊成功/i)).toBeInTheDocument();
    });
  });

  it('displays error message on registration failure', async () => {
    const user = userEvent.setup();
    (authService.register as any).mockRejectedValue({
      response: {
        data: {
          detail: 'A user with this email already exists.'
        }
      }
    });

    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    await user.type(screen.getByLabelText(/顯示名稱/i), 'TestUser');
    await user.type(screen.getByLabelText(/Email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/^密碼/i), 'Password123');
    await user.type(screen.getByLabelText(/確認密碼/i), 'Password123');
    await user.click(screen.getByRole('checkbox', { name: /我同意/i }));
    
    const submitButton = screen.getByRole('button', { name: /註冊/i });
    await user.click(submitButton);

    await waitFor(() => {
      // Expect toast to be called, not text in DOM
      expect(toast.error).toHaveBeenCalledWith(expect.stringMatching(/此 Email 已被註冊/i), expect.any(Object));
    });
  });
});
