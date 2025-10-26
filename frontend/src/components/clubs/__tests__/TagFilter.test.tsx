
// frontend/src/components/clubs/__tests__/TagFilter.test.tsx
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
        onTagToggle={vi.fn()}
      />
    );

    expect(screen.getByText('程式設計')).toBeInTheDocument();
    expect(screen.getByText('科幻')).toBeInTheDocument();
    expect(screen.getByText('商業理財')).toBeInTheDocument();
  });

  it('應該為被選擇的標籤加上高亮樣式和✓符號', () => {
    render(
      <TagFilter
        availableTags={mockTags}
        selectedTagIds={[2]}
        onTagToggle={vi.fn()}
      />
    );

    const selectedTag = screen.getByText(/科幻/);
    expect(selectedTag.className).toContain('bg-blue-500');
    expect(selectedTag).toHaveTextContent('科幻✓');

    const unselectedTag = screen.getByText('程式設計');
    expect(unselectedTag.className).toContain('bg-gray-200');
    expect(unselectedTag).not.toHaveTextContent('✓');
  });

  it('點擊標籤時應該呼叫 onTagToggle 並傳入正確的 ID', () => {
    const handleTagToggle = vi.fn();
    render(
      <TagFilter
        availableTags={mockTags}
        selectedTagIds={[]}
        onTagToggle={handleTagToggle}
      />
    );

    const tagToClick = screen.getByText('商業理財');
    fireEvent.click(tagToClick);

    expect(handleTagToggle).toHaveBeenCalledWith(3);
    expect(handleTagToggle).toHaveBeenCalledTimes(1);
  });

  it('點擊一個已被選擇的標籤時，同樣應該呼叫 onTagToggle', () => {
    const handleTagToggle = vi.fn();
    render(
      <TagFilter
        availableTags={mockTags}
        selectedTagIds={[1, 3]}
        onTagToggle={handleTagToggle}
      />
    );

    const selectedTagToClick = screen.getByText(/程式設計/);
    fireEvent.click(selectedTagToClick);

    expect(handleTagToggle).toHaveBeenCalledWith(1);
    expect(handleTagToggle).toHaveBeenCalledTimes(1);
  });

  it('當沒有選擇任何標籤時，不應顯示計數文字', () => {
    render(
      <TagFilter
        availableTags={mockTags}
        selectedTagIds={[]}
        onTagToggle={vi.fn()}
      />
    );

    expect(screen.queryByText(/已選擇/)).not.toBeInTheDocument();
  });

  it('當有選擇標籤時，應顯示正確的計數文字', () => {
    render(
      <TagFilter
        availableTags={mockTags}
        selectedTagIds={[1, 2, 3]}
        onTagToggle={vi.fn()}
      />
    );

    expect(screen.getByText('已選擇 3 個標籤')).toBeInTheDocument();
  });
});
