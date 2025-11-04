import { useState } from 'react';

interface AddTagModalProps {
  onClose: () => void;
  onAdd: (tags: string[]) => void;
  selectedTags: string[];
}

const AVAILABLE_TAGS = [
  'Fantasy', 'Productivity', 'Memoir', 'Product Design', 
  'Historical', 'Club Q&A', 'Science Fiction', 'Romance',
  'Mystery', 'Thriller', 'Biography', 'Self-Help',
  'Business', 'Technology', 'Travel', 'Cooking',
  'Art', 'Poetry', 'Drama', 'Comics'
];

export default function AddTagModal({ onClose, onAdd, selectedTags }: AddTagModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [tempSelected, setTempSelected] = useState<string[]>([]);

  const filteredTags = AVAILABLE_TAGS.filter(tag => 
    !selectedTags.includes(tag) && 
    tag.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleToggle = (tag: string) => {
    setTempSelected(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleConfirm = () => {
    onAdd(tempSelected);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">新增偏好標籤</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Search */}
        <div className="mb-4">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜尋標籤..."
              className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
            />
            <svg 
              className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Tag Selection */}
        <div className="flex-1 overflow-y-auto mb-6">
          <div className="flex flex-wrap gap-2">
            {filteredTags.map((tag) => (
              <button
                key={tag}
                onClick={() => handleToggle(tag)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all shadow-sm ${
                  tempSelected.includes(tag)
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gradient-to-r hover:from-blue-400 hover:to-blue-500 hover:text-white hover:shadow-md'
                }`}
              >
                <span className="flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  <span>{tag}</span>
                </span>
              </button>
            ))}
            {filteredTags.length === 0 && (
              <div className="w-full text-center py-8 text-gray-500">
                {searchQuery ? '找不到符合的標籤' : '沒有可新增的標籤'}
              </div>
            )}
          </div>
        </div>

        {/* Selected Count */}
        {tempSelected.length > 0 && (
          <div className="mb-4 text-sm text-gray-600">
            已選擇 {tempSelected.length} 個標籤
          </div>
        )}

        {/* Actions */}
        <div className="flex space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            取消
          </button>
          <button
            onClick={handleConfirm}
            disabled={tempSelected.length === 0}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:from-gray-400 disabled:to-gray-400"
          >
            ✓ 新增 {tempSelected.length > 0 && `(${tempSelected.length})`}
          </button>
        </div>
      </div>
    </div>
  );
}
