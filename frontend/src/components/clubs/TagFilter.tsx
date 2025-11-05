// frontend/src/components/clubs/TagFilter.tsx
import { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import type { ClubTag } from '../../types/bookClub';

interface TagFilterProps {
  availableTags: ClubTag[];
  selectedTagIds: number[];
  onApplyFilter: (tagIds: number[]) => void;
  onClearAll: () => void;
}

/**
 * TagFilter - 標籤篩選元件
 * 支援多標籤選擇，需要點擊篩選按鈕才會執行篩選
 */
export const TagFilter = ({ availableTags, selectedTagIds, onApplyFilter, onClearAll }: TagFilterProps) => {
  const [localSelectedTagIds, setLocalSelectedTagIds] = useState<number[]>(selectedTagIds);
  
  // 當外部 selectedTagIds 改變時同步
  useEffect(() => {
    setLocalSelectedTagIds(selectedTagIds);
  }, [selectedTagIds]);
  
  const isSelected = (tagId: number) => localSelectedTagIds.includes(tagId);

  const handleTagClick = (tagId: number) => {
    setLocalSelectedTagIds(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  const handleApplyFilter = () => {
    onApplyFilter(localSelectedTagIds);
  };

  const handleClearAll = () => {
    setLocalSelectedTagIds([]);
    onClearAll();
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">主題標籤篩選</label>
      </div>
      <div className="flex flex-wrap gap-2 pb-2">
        {availableTags.map((tag) => (
          <button
            key={tag.id}
            onClick={() => handleTagClick(tag.id)}
            className={`
              px-3 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap
              ${
                isSelected(tag.id)
                  ? 'bg-blue-500 text-white hover:bg-blue-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }
            `}
          >
            {tag.name}
            {isSelected(tag.id) && (
              <span className="ml-1">✓</span>
            )}
          </button>
        ))}
      </div>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          {localSelectedTagIds.length > 0 ? (
            <>
              <span>已選擇 {localSelectedTagIds.length} 個標籤</span>
              <button
                onClick={handleClearAll}
                className="text-blue-600 hover:text-blue-700 hover:underline"
              >
                清除全部
              </button>
            </>
          ) : (
            <span>請選擇標籤進行篩選</span>
          )}
        </div>
        <Button onClick={handleApplyFilter} variant="primary" className="px-6 py-2">
          篩選
        </Button>
      </div>
    </div>
  );
};
