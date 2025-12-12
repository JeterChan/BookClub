import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import EventCreate from '../EventCreate';
import * as eventService from '../../../../services/eventService';
import { useBookClubStore } from '../../../../store/bookClubStore';

// Mock the services
vi.mock('../../../../services/eventService', () => ({
  createEvent: vi.fn(),
  validateMeetingUrl: vi.fn((url: string) => {
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  }),
  validateEventDatetime: vi.fn((datetime: string) => {
    const eventTime = new Date(datetime);
    const now = new Date();
    return eventTime > now;
  }),
}));

// Mock store
vi.mock('../../../../store/bookClubStore');

// Mock useParams
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ clubId: '1' }),
    useNavigate: () => vi.fn(),
  };
});

const renderEventCreate = () => {
  return render(
    <BrowserRouter>
      <EventCreate />
    </BrowserRouter>
  );
};

describe('EventCreate', () => {
  const mockFetchClubDetail = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup default store mock
    (useBookClubStore as any).mockReturnValue({
      detailClub: { id: 1, membership_status: 'admin' },
      fetchClubDetail: mockFetchClubDetail,
    });
  });

  it('應該渲染所有表單欄位', () => {
    renderEventCreate();

    expect(screen.getByLabelText(/活動名稱/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/活動描述/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/活動時間/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/會議連結/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/參與人數上限/i)).toBeInTheDocument();
  });

  it('應該顯示兩個操作按鈕', () => {
    renderEventCreate();

    expect(screen.getByRole('button', { name: /取消/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /發布活動/i })).toBeInTheDocument();
  });

  it('應該在空白提交時顯示驗證錯誤', async () => {
    const user = userEvent.setup();
    renderEventCreate();

    const publishButton = screen.getByRole('button', { name: /發布活動/i });
    await user.click(publishButton);

    await waitFor(() => {
      expect(screen.getByText(/請輸入活動名稱/i)).toBeInTheDocument();
      expect(screen.getByText(/請輸入活動描述/i)).toBeInTheDocument();
      expect(screen.getByText(/請選擇活動時間/i)).toBeInTheDocument();
      expect(screen.getByText(/請輸入會議連結/i)).toBeInTheDocument();
    });
  });

  it('應該驗證活動名稱長度', async () => {
    const user = userEvent.setup();
    renderEventCreate();

    const titleInput = screen.getByLabelText(/活動名稱/i);
    await user.type(titleInput, 'a'.repeat(101));

    const publishButton = screen.getByRole('button', { name: /發布活動/i });
    await user.click(publishButton);

    await waitFor(() => {
      expect(screen.getByText(/活動名稱不能超過 100 個字元/i)).toBeInTheDocument();
    });
  });

  it('應該驗證活動描述長度', async () => {
    const user = userEvent.setup();
    renderEventCreate();

    const descriptionInput = screen.getByLabelText(/活動描述/i);
    await user.type(descriptionInput, 'a'.repeat(2001));

    const publishButton = screen.getByRole('button', { name: /發布活動/i });
    await user.click(publishButton);

    await waitFor(() => {
      expect(screen.getByText(/活動描述不能超過 2000 個字元/i)).toBeInTheDocument();
    });
  });

  it('應該驗證 URL 必須為 HTTPS', async () => {
    const user = userEvent.setup();
    renderEventCreate();

    const urlInput = screen.getByLabelText(/會議連結/i);
    await user.type(urlInput, 'http://insecure-url.com');

    const publishButton = screen.getByRole('button', { name: /發布活動/i });
    await user.click(publishButton);

    await waitFor(() => {
      expect(screen.getByText(/會議連結必須為有效的 HTTPS URL/i)).toBeInTheDocument();
    });
  });

  it('應該成功發布活動', async () => {
    const user = userEvent.setup();
    const mockCreateEvent = vi.mocked(eventService.createEvent);
    mockCreateEvent.mockResolvedValue({
      id: 1,
      clubId: 1,
      title: '測試活動',
      description: '測試描述',
      eventDatetime: new Date(Date.now() + 86400000).toISOString(),
      meetingUrl: 'https://meet.google.com/test',
      organizerId: 1,
      maxParticipants: null,
      status: 'published',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      participantCount: 0,
    });

    renderEventCreate();

    // 填寫表單
    await user.type(screen.getByLabelText(/活動名稱/i), '測試活動');
    await user.type(screen.getByLabelText(/活動描述/i), '測試描述');
    // Need to handle date picker input specifically or mock it better if this fails
    // For now assuming text input works for DateTimePicker as per previous code
    
    await user.type(screen.getByLabelText(/會議連結/i), 'https://meet.google.com/test');
    
    // Since DateTimePicker is complex, we might need to simulate its value change differently
    // But if it renders an input, typing might work if not readonly.
    // If it fails, I'll need to investigate DateTimePicker.
    
    // Note: Input for datetime-local is tricky with userEvent.type. 
    // Let's bypass validation for datetime in this specific test step if it gets stuck,
    // OR ensure we type a valid datetime-local string.
    const dateInput = screen.getByLabelText(/活動時間/i);
    fireEvent.change(dateInput, { target: { value: '2025-12-31T10:00' } });

    // 點擊發布活動
    const publishButton = screen.getByRole('button', { name: /發布活動/i });
    await user.click(publishButton);

    await waitFor(() => {
      expect(mockCreateEvent).toHaveBeenCalledWith(
        1,
        expect.objectContaining({
          title: '測試活動',
          description: '測試描述',
          meetingUrl: 'https://meet.google.com/test',
          status: 'published',
        })
      );
    });
  });
});

// Import fireEvent for the date input hack
import { fireEvent } from '@testing-library/react';