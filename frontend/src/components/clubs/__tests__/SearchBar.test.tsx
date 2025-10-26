
// frontend/src/components/clubs/__tests__/SearchBar.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SearchBar } from '../SearchBar';

describe('SearchBar', () => {
  let onChange: ReturnType<typeof vi.fn>;
  let onSearch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    onChange = vi.fn();
    onSearch = vi.fn();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('應該渲染輸入框和搜尋圖示', () => {
    render(<SearchBar value="" onChange={onChange} onSearch={onSearch} />);
    expect(screen.getByPlaceholderText('搜尋讀書會名稱或簡介...')).toBeInTheDocument();
    // Check for search icon via its path data
    expect(document.querySelector('path[d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"]')).toBeInTheDocument();
  });

  it('當輸入框為空時，不應顯示清除按鈕', () => {
    render(<SearchBar value="" onChange={onChange} onSearch={onSearch} />);
    expect(document.querySelector('path[d="M6 18L18 6M6 6l12 12"]')).not.toBeInTheDocument();
  });

  it('當輸入框有文字時，應該顯示清除按鈕', () => {
    render(<SearchBar value="test" onChange={onChange} onSearch={onSearch} />);
    // The component uses localValue, so we need to simulate typing
    const input = screen.getByPlaceholderText('搜尋讀書會名稱或簡介...');
    fireEvent.change(input, { target: { value: 'test' } });
    expect(document.querySelector('path[d="M6 18L18 6M6 6l12 12"]')).toBeInTheDocument();
  });

  it('輸入文字時應更新內部狀態', () => {
    render(<SearchBar value="" onChange={onChange} onSearch={onSearch} />);
    const input = screen.getByPlaceholderText('搜尋讀書會名稱或簡介...') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'hello' } });
    expect(input.value).toBe('hello');
  });

  it('輸入後經過300ms debounce，應該呼叫 onChange 和 onSearch', () => {
    render(<SearchBar value="" onChange={onChange} onSearch={onSearch} />);
    const input = screen.getByPlaceholderText('搜尋讀書會名稱或簡介...');

    fireEvent.change(input, { target: { value: 'world' } });

    // 立即檢查，此時不應呼叫
    expect(onChange).not.toHaveBeenCalled();
    expect(onSearch).not.toHaveBeenCalled();

    // 快轉時間
    vi.advanceTimersByTime(300);

    // 檢查是否已呼叫
    expect(onChange).toHaveBeenCalledWith('world');
    expect(onSearch).toHaveBeenCalledTimes(1);
  });

  it('在 debounce 間隔內連續輸入，只應在最後一次輸入後觸發一次', () => {
    render(<SearchBar value="" onChange={onChange} onSearch={onSearch} />);
    const input = screen.getByPlaceholderText('搜尋讀書會名稱或簡介...');

    fireEvent.change(input, { target: { value: 'a' } });
    vi.advanceTimersByTime(150);
    fireEvent.change(input, { target: { value: 'ab' } });
    vi.advanceTimersByTime(150);
    fireEvent.change(input, { target: { value: 'abc' } });

    // 總時間 300ms，但尚未達到最後一次輸入的 debounce 時間
    expect(onChange).not.toHaveBeenCalled();
    expect(onSearch).not.toHaveBeenCalled();

    // 快轉到最後一次輸入的 debounce 時間結束
    vi.advanceTimersByTime(300);

    expect(onChange).toHaveBeenCalledWith('abc');
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onSearch).toHaveBeenCalledTimes(1);
  });

  it('點擊清除按鈕應清空輸入並立即呼叫 onChange 和 onSearch', () => {
    render(<SearchBar value="test" onChange={onChange} onSearch={onSearch} />);
    const input = screen.getByPlaceholderText('搜尋讀書會名稱或簡介...');
    fireEvent.change(input, { target: { value: 'test' } });

    const clearButton = screen.getByRole('button');
    fireEvent.click(clearButton);

    expect((input as HTMLInputElement).value).toBe('');
    expect(onChange).toHaveBeenCalledWith('');
    expect(onSearch).toHaveBeenCalledTimes(1);
  });
});
