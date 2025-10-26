
// frontend/src/components/common/__tests__/Pagination.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Pagination } from '../Pagination';
import type { PaginationMeta } from '../../../types/bookClub';

const onPageChange = vi.fn();

describe('Pagination', () => {
  beforeEach(() => {
    onPageChange.mockClear();
  });

  const firstPageMeta: PaginationMeta = {
    page: 1,
    page_size: 10,
    total_pages: 10,
    total_items: 100,
    has_next: true,
    has_previous: false,
  };

  const middlePageMeta: PaginationMeta = {
    page: 5,
    page_size: 10,
    total_pages: 10,
    total_items: 100,
    has_next: true,
    has_previous: true,
  };

  const lastPageMeta: PaginationMeta = {
    page: 10,
    page_size: 10,
    total_pages: 10,
    total_items: 100,
    has_next: false,
    has_previous: true,
  };

  it('應該正確渲染分頁資訊', () => {
    render(<Pagination pagination={middlePageMeta} onPageChange={onPageChange} />);

    const expectedText = '顯示第 41 到 50 項，共 100 個讀書會';
    screen.getByText((content, node) => {
      const hasText = (node: Element | null) => node?.textContent === expectedText;
      const nodeHasText = hasText(node);
      const childrenDontHaveText = Array.from(node?.children || []).every(
        (child) => !hasText(child)
      );
      return nodeHasText && childrenDontHaveText;
    });

    expect(screen.getByText('5 / 10')).toBeInTheDocument();
  });

  it('在第一頁時，"上一頁" 按鈕應該被禁用', () => {
    render(<Pagination pagination={firstPageMeta} onPageChange={onPageChange} />);
    
    const prevButtons = screen.getAllByText('上一頁');
    expect(prevButtons[0]).toBeDisabled();

    const prevIcon = screen.getByLabelText('Pagination').querySelector('button:first-child');
    expect(prevIcon).toBeDisabled();
  });

  it('在最後一頁時，"下一頁" 按鈕應該被禁用', () => {
    render(<Pagination pagination={lastPageMeta} onPageChange={onPageChange} />);

    const nextButtons = screen.getAllByText('下一頁');
    expect(nextButtons[0]).toBeDisabled();

    const nextIcon = screen.getByLabelText('Pagination').querySelector('button:last-child');
    expect(nextIcon).toBeDisabled();
  });

  it('在中間頁時，"上一頁" 和 "下一頁" 按鈕都應該是啟用的', () => {
    render(<Pagination pagination={middlePageMeta} onPageChange={onPageChange} />);

    const prevButtons = screen.getAllByText('上一頁');
    expect(prevButtons[0]).toBeEnabled();
    const nextButtons = screen.getAllByText('下一頁');
    expect(nextButtons[0]).toBeEnabled();
  });

  it('點擊 "下一頁" 按鈕時應該呼叫 onPageChange 並傳入正確的頁碼', () => {
    render(<Pagination pagination={middlePageMeta} onPageChange={onPageChange} />);
    
    const nextButtons = screen.getAllByText('下一頁');
    fireEvent.click(nextButtons[0]);

    expect(onPageChange).toHaveBeenCalledWith(6);
    expect(onPageChange).toHaveBeenCalledTimes(1);
  });

  it('點擊 "上一頁" 按鈕時應該呼叫 onPageChange 並傳入正確的頁碼', () => {
    render(<Pagination pagination={middlePageMeta} onPageChange={onPageChange} />);
    
    const prevButtons = screen.getAllByText('上一頁');
    fireEvent.click(prevButtons[0]);

    expect(onPageChange).toHaveBeenCalledWith(4);
    expect(onPageChange).toHaveBeenCalledTimes(1);
  });

  it('點擊被禁用的按鈕時不應該呼叫 onPageChange', () => {
    render(<Pagination pagination={firstPageMeta} onPageChange={onPageChange} />);
    
    const prevButtons = screen.getAllByText('上一頁');
    fireEvent.click(prevButtons[0]);

    expect(onPageChange).not.toHaveBeenCalled();
  });
});
