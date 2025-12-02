import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TagFilter } from '../TagFilter';
import type { ClubTag } from '../../../types/bookClub';

const mockTags: ClubTag[] = [
  { id: 1, name: '程式設計', is_predefined: true },
  { id: 2, name: '科幻', is_predefined: true },
  { id: 3, name: '商業理財', is_predefined: false },
];

describe('TagFilter', () => {
  it('應該渲染所有可用的標籤', () => {
    render(
      <TagFilter
        availableTags={mockTags}
        selectedTagIds={[]}
        onApplyFilter={vi.fn()}
        onClearAll={vi.fn()}
      />
    );

    expect(screen.getByText('程式設計')).toBeInTheDocument();
    expect(screen.getByText('科幻')).toBeInTheDocument();
    expect(screen.getByText('商業理財')).toBeInTheDocument();
  });

  it('應該為被選擇的標籤加上高亮樣式', () => {
    render(
      <TagFilter
        availableTags={mockTags}
        selectedTagIds={[2]}
        onApplyFilter={vi.fn()}
        onClearAll={vi.fn()}
      />
    );

    const selectedTag = screen.getByText('科幻');
    // Using class check logic based on component (bg-black text-white)
    expect(selectedTag.className).toContain('bg-black');
    expect(selectedTag.className).toContain('text-white');

    const unselectedTag = screen.getByText('程式設計');
    expect(unselectedTag.className).toContain('bg-white');
    expect(unselectedTag.className).toContain('text-gray-700');
  });

  it('點擊標籤時應該更新 UI 狀態，點擊篩選按鈕時應該呼叫 onApplyFilter', () => {
    const handleApplyFilter = vi.fn();
    render(
      <TagFilter
        availableTags={mockTags}
        selectedTagIds={[]}
        onApplyFilter={handleApplyFilter}
        onClearAll={vi.fn()}
      />
    );

    const tagToClick = screen.getByText('商業理財');
    fireEvent.click(tagToClick);
    
    // Check if style updated (local state)
    expect(tagToClick.className).toContain('bg-black');

    const filterButton = screen.getByText('篩選');
    fireEvent.click(filterButton);

    expect(handleApplyFilter).toHaveBeenCalledWith([3]);
    expect(handleApplyFilter).toHaveBeenCalledTimes(1);
  });

  it('點擊一個已被選擇的標籤時，應該取消選擇', () => {
    const handleApplyFilter = vi.fn();
    render(
      <TagFilter
        availableTags={mockTags}
        selectedTagIds={[1, 3]}
        onApplyFilter={handleApplyFilter}
        onClearAll={vi.fn()}
      />
    );

    const selectedTagToClick = screen.getByText('程式設計');
    fireEvent.click(selectedTagToClick);
    
    // Check if style updated (local state)
    expect(selectedTagToClick.className).toContain('bg-white');

    const filterButton = screen.getByText('篩選');
    fireEvent.click(filterButton);

    expect(handleApplyFilter).toHaveBeenCalledWith([3]);
    expect(handleApplyFilter).toHaveBeenCalledTimes(1);
  });

  it('當沒有選擇任何標籤時，不應顯示計數文字和清除按鈕', () => {
    render(
      <TagFilter
        availableTags={mockTags}
        selectedTagIds={[]}
        onApplyFilter={vi.fn()}
        onClearAll={vi.fn()}
      />
    );

    expect(screen.queryByText(/已選擇/)).not.toBeInTheDocument();
    expect(screen.queryByText('清除篩選')).not.toBeInTheDocument();
  });

  it('當有選擇標籤時，應顯示正確的計數文字和清除按鈕', () => {
    const handleClearAll = vi.fn();
    render(
      <TagFilter
        availableTags={mockTags}
        selectedTagIds={[1, 2, 3]}
        onApplyFilter={vi.fn()}
        onClearAll={handleClearAll}
      />
    );

    expect(screen.getByText('已選擇 3 個標籤')).toBeInTheDocument();
    
    const clearButton = screen.getByText('清除篩選');
    fireEvent.click(clearButton);
    expect(handleClearAll).toHaveBeenCalled();
  });
});