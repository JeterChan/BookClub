import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SearchBar } from '../SearchBar';

describe('SearchBar', () => {
  let onChange: ReturnType<typeof vi.fn>;
  let onSearch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    onChange = vi.fn();
    onSearch = vi.fn();
  });

  it('應該渲染輸入框和搜尋圖示', () => {
    render(<SearchBar value="" onChange={onChange} onSearch={onSearch} />);
    expect(screen.getByPlaceholderText('搜尋讀書會名稱或簡介...')).toBeInTheDocument();
    // Check for search icon in the button
    expect(screen.getByText('搜尋')).toBeInTheDocument();
  });

  it('當輸入框為空時，不應顯示清除按鈕', () => {
    render(<SearchBar value="" onChange={onChange} onSearch={onSearch} />);
    expect(screen.queryByLabelText('清除搜尋')).not.toBeInTheDocument();
  });

  it('當輸入框有文字時，應該顯示清除按鈕', () => {
    render(<SearchBar value="test" onChange={onChange} onSearch={onSearch} />);
    const input = screen.getByPlaceholderText('搜尋讀書會名稱或簡介...');
    fireEvent.change(input, { target: { value: 'test' } });
    expect(screen.getByLabelText('清除搜尋')).toBeInTheDocument();
  });

  it('輸入文字時應更新內部狀態', () => {
    render(<SearchBar value="" onChange={onChange} onSearch={onSearch} />);
    const input = screen.getByPlaceholderText('搜尋讀書會名稱或簡介...') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'hello' } });
    expect(input.value).toBe('hello');
  });

  it('點擊搜尋按鈕時，應該呼叫 onChange 和 onSearch', () => {
    render(<SearchBar value="" onChange={onChange} onSearch={onSearch} />);
    const input = screen.getByPlaceholderText('搜尋讀書會名稱或簡介...');
    fireEvent.change(input, { target: { value: 'world' } });
    
    const searchButton = screen.getByText('搜尋');
    fireEvent.click(searchButton);

    expect(onChange).toHaveBeenCalledWith('world');
    expect(onSearch).toHaveBeenCalledTimes(1);
  });

  it('按下 Enter 鍵時，應該呼叫 onChange 和 onSearch', () => {
    render(<SearchBar value="" onChange={onChange} onSearch={onSearch} />);
    const input = screen.getByPlaceholderText('搜尋讀書會名稱或簡介...');
    fireEvent.change(input, { target: { value: 'world' } });
    
    fireEvent.keyPress(input, { key: 'Enter', code: 13, charCode: 13 });

    expect(onChange).toHaveBeenCalledWith('world');
    expect(onSearch).toHaveBeenCalledTimes(1);
  });

  it('點擊清除按鈕應清空輸入並立即呼叫 onChange 和 onSearch', () => {
    render(<SearchBar value="test" onChange={onChange} onSearch={onSearch} />);
    const input = screen.getByPlaceholderText('搜尋讀書會名稱或簡介...');
    fireEvent.change(input, { target: { value: 'test' } });

    const clearButton = screen.getByLabelText('清除搜尋');
    fireEvent.click(clearButton);

    expect((input as HTMLInputElement).value).toBe('');
    expect(onChange).toHaveBeenCalledWith('');
    expect(onSearch).toHaveBeenCalledTimes(1);
  });
});