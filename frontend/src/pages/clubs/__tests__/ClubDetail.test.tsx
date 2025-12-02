// frontend/src/pages/clubs/__tests__/ClubDetail.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import ClubDetail from '../ClubDetail';
import { useBookClubStore } from '../../../store/bookClubStore';
import { useAuthStore } from '../../../store/authStore';
import toast from 'react-hot-toast';

// Mock the store
vi.mock('../../../store/bookClubStore');
vi.mock('../../../store/authStore');

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn()
  }
}));

describe('ClubDetail Component', () => {
  // 基本測試數據
  const mockPublicClub = {
    id: 1,
    name: '測試公開讀書會',
    description: '這是一個測試用的公開讀書會',
    visibility: 'public',
    cover_image_url: null,
    owner_id: 2,
    created_at: '2025-10-25T10:00:00.000Z',
    updated_at: '2025-10-25T10:00:00.000Z',
    owner: {
      id: 2,
      email: 'owner@example.com',
      display_name: '讀書會創建者',
      avatar_url: null
    },
    tags: [{ id: 1, name: '文學', is_predefined: true }],
    member_count: 5
  };

  const mockPrivateClub = {
    ...mockPublicClub,
    id: 2,
    name: '測試私密讀書會',
    visibility: 'private'
  };

  // 重置 mocks
  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock for auth store - authenticated
    (useAuthStore as any).mockReturnValue({
      isAuthenticated: true,
      user: { id: 1, name: 'Test User' }
    });
  });

  // 測試 1: 未加入的公開讀書會顯示「加入讀書會」按鈕
  test('shows "加入讀書會" button for public club when not a member', () => {
    // 設置 mock store
    const mockFetchClubDetail = vi.fn();
    const mockJoinClub = vi.fn();
    
    vi.mocked(useBookClubStore).mockReturnValue({
      detailClub: { ...mockPublicClub, membership_status: 'not_member' },
      loading: false,
      error: null,
      fetchClubDetail: mockFetchClubDetail,
      joinClub: mockJoinClub
    });

    render(
      <MemoryRouter initialEntries={['/clubs/1']}>
        <Routes>
          <Route path="/clubs/:clubId" element={<ClubDetail />} />
        </Routes>
      </MemoryRouter>
    );

    // 驗證「加入讀書會」按鈕存在
    const joinButton = screen.getByText('加入讀書會');
    expect(joinButton).toBeInTheDocument();
    
    // 點擊按鈕
    fireEvent.click(joinButton);
    
    // 驗證 joinClub 被調用
    expect(mockJoinClub).toHaveBeenCalledWith(1);
  });

  // 測試 2: 未加入的私密讀書會顯示「加入讀書會」按鈕 (統一顯示文字)
  test('shows "加入讀書會" button for private club when not a member', () => {
    // 設置 mock store
    const mockFetchClubDetail = vi.fn();
    const mockJoinClub = vi.fn();
    
    vi.mocked(useBookClubStore).mockReturnValue({
      detailClub: { ...mockPrivateClub, membership_status: 'not_member' },
      loading: false,
      error: null,
      fetchClubDetail: mockFetchClubDetail,
      joinClub: mockJoinClub
    });

    render(
      <MemoryRouter initialEntries={['/clubs/2']}>
        <Routes>
          <Route path="/clubs/:clubId" element={<ClubDetail />} />
        </Routes>
      </MemoryRouter>
    );

    // 驗證「加入讀書會」按鈕存在 (私密社團也顯示加入，點擊後邏輯不同)
    const joinButton = screen.getByText('加入讀書會');
    expect(joinButton).toBeInTheDocument();
    
    // 點擊按鈕
    fireEvent.click(joinButton);
    
    // 驗證 joinClub 被調用
    expect(mockJoinClub).toHaveBeenCalledWith(2);
  });

  // 測試 3: 已加入的讀書會顯示「退出讀書會」按鈕
  test('shows "退出讀書會" button when user is a member', () => {
    // 設置 mock store
    const mockFetchClubDetail = vi.fn();
    const mockLeaveClub = vi.fn();
    
    vi.mocked(useBookClubStore).mockReturnValue({
      detailClub: { ...mockPublicClub, membership_status: 'member' },
      loading: false,
      error: null,
      fetchClubDetail: mockFetchClubDetail,
      leaveClub: mockLeaveClub
    });

    render(
      <MemoryRouter initialEntries={['/clubs/1']}>
        <Routes>
          <Route path="/clubs/:clubId" element={<ClubDetail />} />
        </Routes>
      </MemoryRouter>
    );

    // 驗證「退出讀書會」按鈕存在
    const leaveButton = screen.getByText('退出讀書會');
    expect(leaveButton).toBeInTheDocument();
    
    // 點擊按鈕
    fireEvent.click(leaveButton);
    
    // 驗證 leaveClub 被調用
    expect(mockLeaveClub).toHaveBeenCalledWith(1);
  });

  // 測試 4: 已請求加入的私密讀書會顯示禁用的「等待審核」按鈕
  test('shows disabled "等待審核" button when join request is pending', () => {
    // 設置 mock store
    const mockFetchClubDetail = vi.fn();
    
    vi.mocked(useBookClubStore).mockReturnValue({
      detailClub: { ...mockPrivateClub, membership_status: 'pending_request' },
      loading: false,
      error: null,
      fetchClubDetail: mockFetchClubDetail
    });

    render(
      <MemoryRouter initialEntries={['/clubs/2']}>
        <Routes>
          <Route path="/clubs/:clubId" element={<ClubDetail />} />
        </Routes>
      </MemoryRouter>
    );

    // 驗證「等待審核」按鈕存在且被禁用
    const pendingButton = screen.getByText('等待審核');
    expect(pendingButton).toBeInTheDocument();
    expect(pendingButton).toBeDisabled();
  });

  // 測試 5: 載入中狀態顯示載入指示器
  test('shows loading indicator when loading', () => {
    // 設置 mock store
    const mockFetchClubDetail = vi.fn();

    vi.mocked(useBookClubStore).mockReturnValue({
      detailClub: mockPublicClub,
      loading: true,
      error: null,
      fetchClubDetail: mockFetchClubDetail
    });

    render(
      <MemoryRouter initialEntries={['/clubs/1']}>
        <Routes>
          <Route path="/clubs/:clubId" element={<ClubDetail />} />
        </Routes>
      </MemoryRouter>
    );

    // 驗證載入指示器存在
    const loadingIndicator = screen.getByText('載入中...');
    expect(loadingIndicator).toBeInTheDocument();
  });

  // 測試 6: 操作成功時顯示成功提示
  test('shows success toast when joining club succeeds', async () => {
    // 設置 mock store
    const mockFetchClubDetail = vi.fn();
    // Mock return value structure expected by component
    const mockJoinClub = vi.fn().mockResolvedValue({ joined: true, requires_approval: false });

    vi.mocked(useBookClubStore).mockReturnValue({
      detailClub: { ...mockPublicClub, membership_status: 'not_member' },
      loading: false,
      error: null,
      fetchClubDetail: mockFetchClubDetail,
      joinClub: mockJoinClub
    });

    render(
      <MemoryRouter initialEntries={['/clubs/1']}>
        <Routes>
          <Route path="/clubs/:clubId" element={<ClubDetail />} />
        </Routes>
      </MemoryRouter>
    );

    // 點擊加入按鈕
    const joinButton = screen.getByText('加入讀書會');
    fireEvent.click(joinButton);
    
    // 等待操作完成
    await waitFor(() => {
      expect(mockJoinClub).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith('成功加入讀書會！');
    });
  });

  // 測試 7: 操作失敗時呼叫 joinClub
  test('calls joinClub on button click even if it fails', async () => {
    // 設置 mock store
    const mockFetchClubDetail = vi.fn();
    const mockJoinClub = vi.fn().mockRejectedValue(new Error('加入讀書會失敗'));

    vi.mocked(useBookClubStore).mockReturnValue({
      detailClub: { ...mockPublicClub, membership_status: 'not_member' },
      loading: false,
      error: null,
      fetchClubDetail: mockFetchClubDetail,
      joinClub: mockJoinClub
    });

    render(
      <MemoryRouter initialEntries={['/clubs/1']}>
        <Routes>
          <Route path="/clubs/:clubId" element={<ClubDetail />} />
        </Routes>
      </MemoryRouter>
    );

    // 點擊加入按鈕
    const joinButton = screen.getByText('加入讀書會');
    fireEvent.click(joinButton);
    
    // 等待操作完成
    await waitFor(() => {
      expect(mockJoinClub).toHaveBeenCalled();
    });
  });

  // 測試 7b: 當 store 有錯誤時顯示錯誤提示
  test('shows error toast when store reports error', () => {
    const mockFetchClubDetail = vi.fn();
    const mockClearError = vi.fn();

    vi.mocked(useBookClubStore).mockReturnValue({
      detailClub: { ...mockPublicClub, membership_status: 'not_member' },
      loading: false,
      error: '加入讀書會失敗',
      fetchClubDetail: mockFetchClubDetail,
      clearError: mockClearError
    });

    render(
      <MemoryRouter initialEntries={['/clubs/1']}>
        <Routes>
          <Route path="/clubs/:clubId" element={<ClubDetail />} />
        </Routes>
      </MemoryRouter>
    );

    expect(toast.error).toHaveBeenCalledWith('加入讀書會失敗');
    expect(mockClearError).toHaveBeenCalled();
  });

  // 測試 8: 擁有者或管理員顯示「管理」按鈕
  test('shows "管理" button for owner or admin', () => {
    const mockFetchClubDetail = vi.fn();
    vi.mocked(useBookClubStore).mockReturnValue({
      detailClub: { ...mockPublicClub, membership_status: 'owner' },
      loading: false,
      error: null,
      fetchClubDetail: mockFetchClubDetail,
    });

    render(
      <MemoryRouter initialEntries={['/clubs/1']}>
        <Routes>
          <Route path="/clubs/:clubId" element={<ClubDetail />} />
        </Routes>
      </MemoryRouter>
    );

    const manageButton = screen.getByText('管理');
    expect(manageButton).toBeInTheDocument();
    fireEvent.click(manageButton);
  });
});
