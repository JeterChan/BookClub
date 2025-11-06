// frontend/src/components/clubs/TagFilter.tsx
import { useState, useEffect } from 'react';
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
    <div className="space-y-4">
      {/* 標籤篩選標題 */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-700">主題標籤篩選標籤</span>
      </div>
      
      {/* 標籤按鈕組 */}
      <div className="flex flex-wrap gap-2">
        {availableTags.map((tag) => (
          <button
            key={tag.id}
            onClick={() => handleTagClick(tag.id)}
            className={`
              px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border
              ${
                isSelected(tag.id)
                  ? 'bg-black text-white border-black hover:bg-gray-800'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400 hover:bg-gray-50'
              }
            `}
          >
            {tag.name}
          </button>
        ))}
      </div>

      {/* 底部操作區 */}
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-3">
          {localSelectedTagIds.length > 0 && (
            <>
              <span className="text-sm text-gray-600">
                已選擇 {localSelectedTagIds.length} 個標籤
              </span>
              <button
                onClick={handleClearAll}
                className="text-sm text-gray-600 hover:text-gray-900 underline"
              >
                清除篩選
              </button>
            </>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleApplyFilter}
            className="px-6 py-2.5 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            篩選
          </button>
        </div>
      </div>
    </div>
  );
};
