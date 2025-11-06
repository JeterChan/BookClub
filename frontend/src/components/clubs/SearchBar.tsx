// frontend/src/components/clubs/SearchBar.tsx
import { useState } from 'react';
import type { KeyboardEvent } from 'react';
import { Button } from '../ui/Button';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
}

/**
 * SearchBar - 搜尋列元件
 * 需要使用者點擊搜尋按鈕才會執行搜尋
 */
export const SearchBar = ({ value, onChange, onSearch }: SearchBarProps) => {
  const [localValue, setLocalValue] = useState(value);

  const handleSearch = () => {
    onChange(localValue);
    onSearch();
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleClear = () => {
    setLocalValue('');
    onChange('');
    onSearch();
  };

  return (
    <div className="flex gap-3">
      <div className="relative flex-1">
        <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
          <svg
            className="w-5 h-5 text-gray-400 transition-colors"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <input
          type="text"
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="搜尋讀書會名稱或簡介..."
          className="block w-full pl-12 pr-12 py-3 border-2 border-gray-200 rounded-xl transition-all duration-200 focus:ring-2 focus:ring-gray-900 focus:border-gray-900 focus:outline-none hover:border-gray-300 shadow-sm"
        />
        {localValue && (
          <button
            onClick={handleClear}
            className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-red-500 transition-colors duration-200"
            aria-label="清除搜尋"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>
      <Button 
        onClick={handleSearch} 
        variant="primary"
        className="px-6 shadow-sm hover:shadow-md transition-shadow"
      >
        <span className="flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          搜尋
        </span>
      </Button>
    </div>
  );
};
