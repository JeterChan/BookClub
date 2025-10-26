// frontend/src/components/clubs/TagFilter.tsx
import type { ClubTag } from '../../types/bookClub';

interface TagFilterProps {
  availableTags: ClubTag[];
  selectedTagIds: number[];
  onTagToggle: (tagId: number) => void;
}

/**
 * TagFilter - 標籤篩選元件
 * 支援多標籤選擇
 */
export const TagFilter = ({ availableTags, selectedTagIds, onTagToggle }: TagFilterProps) => {
  const isSelected = (tagId: number) => selectedTagIds.includes(tagId);

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-gray-700">主題標籤篩選</label>
      <div className="flex flex-wrap gap-2 overflow-x-auto pb-2">
        {availableTags.map((tag) => (
          <button
            key={tag.id}
            onClick={() => onTagToggle(tag.id)}
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
      {selectedTagIds.length > 0 && (
        <div className="text-xs text-gray-500">
          已選擇 {selectedTagIds.length} 個標籤
        </div>
      )}
    </div>
  );
};
