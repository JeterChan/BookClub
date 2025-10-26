
// frontend/src/components/clubs/__tests__/ClubCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { ClubCard } from '../ClubCard';
import type { BookClubListItem } from '../../../types/bookClub';

// Mock useNavigate
const mockedNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockedNavigate,
  };
});

const mockClub: BookClubListItem = {
  id: 1,
  name: '科幻小說讀書會',
  description: '這是一個專注於討論經典與現代科幻小說的社群。我們每月閱讀一本書，並在線上聚會中分享心得。歡迎所有對未來、科技與想像力充滿熱情的讀者加入！',
  cover_image_url: 'https://example.com/sci-fi-cover.jpg',
  member_count: 42,
  tags: [
    { id: 1, name: '科幻', is_predefined: true },
    { id: 2, name: '小說', is_predefined: true },
    { id: 3, name: '經典', is_predefined: false },
  ],
};

const TestWrapper = ({ club }: { club: BookClubListItem }) => (
  <MemoryRouter>
    <ClubCard club={club} />
  </MemoryRouter>
);

describe('ClubCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('應該正確渲染讀書會資訊', () => {
    render(<TestWrapper club={mockClub} />);
    
    expect(screen.getByText('科幻小說讀書會')).toBeInTheDocument();
    expect(screen.getByText(/這是一個專注於討論經典與現代科幻小說的社群/)).toBeInTheDocument();
    expect(screen.getByText(/42 成員/)).toBeInTheDocument();
  });

  it('當簡介很長時，應該在 DOM 中渲染完整文字（由 CSS line-clamp 處理截斷）', () => {
    render(<TestWrapper club={mockClub} />);
    // We expect the full text to be in the document, as CSS handles the visual truncation.
    expect(screen.getByText(mockClub.description)).toBeInTheDocument();
  });

  it('當簡介少於或等於100字元時，應該完整顯示', () => {
    const shortDescriptionClub = { ...mockClub, description: '短簡介' };
    render(<TestWrapper club={shortDescriptionClub} />);
    expect(screen.getByText('短簡介')).toBeInTheDocument();
    expect(screen.queryByText(/\.\.\./)).not.toBeInTheDocument();
  });

  it('當沒有簡介時，應該顯示 "暫無簡介"', () => {
    const noDescriptionClub = { ...mockClub, description: '' };
    render(<TestWrapper club={noDescriptionClub} />);
    expect(screen.getByText('暫無簡介')).toBeInTheDocument();
  });

  it('應該顯示封面圖片', () => {
    render(<TestWrapper club={mockClub} />);
    const img = screen.getByAltText('科幻小說讀書會') as HTMLImageElement;
    expect(img).toBeInTheDocument();
    expect(img.src).toBe(mockClub.cover_image_url);
  });

  it('當沒有封面圖片時，應該顯示預設圖示', () => {
    const noCoverClub = { ...mockClub, cover_image_url: null };
    render(<TestWrapper club={noCoverClub} />);
    expect(screen.getByText('📚')).toBeInTheDocument();
    expect(screen.queryByAltText('科幻小說讀書會')).not.toBeInTheDocument();
  });

  it('應該顯示前兩個標籤，並為多餘的標籤顯示 "+N" 指示', () => {
    render(<TestWrapper club={mockClub} />);
    expect(screen.getByText('科幻')).toBeInTheDocument();
    expect(screen.getByText('小說')).toBeInTheDocument();
    expect(screen.queryByText('經典')).not.toBeInTheDocument();
    expect(screen.getByText('+1')).toBeInTheDocument();
  });

  it('當標籤少於或等於兩個時，應該全部顯示', () => {
    const twoTagsClub = { ...mockClub, tags: mockClub.tags.slice(0, 2) };
    render(<TestWrapper club={twoTagsClub} />);
    expect(screen.getByText('科幻')).toBeInTheDocument();
    expect(screen.getByText('小說')).toBeInTheDocument();
    expect(screen.queryByText(/\+/)).not.toBeInTheDocument();
  });

  it('點擊卡片時應該導航到詳細頁面', () => {
    render(<TestWrapper club={mockClub} />);
    const card = screen.getByRole('button');
    fireEvent.click(card);
    expect(mockedNavigate).toHaveBeenCalledWith('/clubs/1');
  });

  it('在卡片上按下 Enter 鍵時應該導航到詳細頁面', () => {
    render(<TestWrapper club={mockClub} />);
    const card = screen.getByRole('button');
    fireEvent.keyDown(card, { key: 'Enter', code: 'Enter' });
    expect(mockedNavigate).toHaveBeenCalledWith('/clubs/1');
  });

  it('在卡片上按下 Space 鍵時應該導航到詳細頁面', () => {
    render(<TestWrapper club={mockClub} />);
    const card = screen.getByRole('button');
    fireEvent.keyDown(card, { key: ' ', code: 'Space' });
    expect(mockedNavigate).toHaveBeenCalledWith('/clubs/1');
  });
});
