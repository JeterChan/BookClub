// frontend/src/components/ui/DateTimePicker.tsx
import { forwardRef, useId } from 'react';
import type { InputHTMLAttributes } from 'react';
import { clsx } from 'clsx';

export interface DateTimePickerProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
  helperText?: string;
  disablePast?: boolean;
}

/**
 * DateTimePicker 元件
 * 使用原生 HTML5 datetime-local input
 * - 支援日期和時間選擇
 * - 可禁用過去時間
 * - 自動處理本地時區和 UTC 轉換
 */
export const DateTimePicker = forwardRef<HTMLInputElement, DateTimePickerProps>(
  ({ label, error, helperText, disablePast = false, className, onChange, ...props }, ref) => {
    const id = useId();
    const inputId = props.id || id;

    // 取得當前時間（本地時區），加1分鐘緩衝避免邊界問題
    const now = new Date();
    now.setMinutes(now.getMinutes() + 1);
    const minDateTime = disablePast
      ? now.toISOString().slice(0, 16) // YYYY-MM-DDTHH:mm 格式
      : undefined;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const localDatetime = e.target.value;
      if (localDatetime && disablePast) {
        const selectedDate = new Date(localDatetime);
        const currentDate = new Date();
        
        // 驗證選擇的時間是否在未來
        if (selectedDate <= currentDate) {
          e.preventDefault();
          return; // 不觸發 onChange，阻止選擇過去時間
        }
      }
      
      if (onChange) {
        onChange(e);
      }
    };

    return (
      <div className="w-full">
        {label && (
          <label 
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        
        <div className="relative min-h-[calc(theme(spacing.12)+theme(spacing.6))]">
          <input
            id={inputId}
            ref={ref}
            type="datetime-local"
            min={minDateTime}
            className={clsx(
              'w-full px-4 py-3 border rounded-lg transition-all',
              'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
              error
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300',
              props.disabled && 'bg-gray-100 cursor-not-allowed opacity-60',
              className
            )}
            aria-invalid={!!error}
            aria-describedby={
              error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined
            }
            onChange={handleChange}
            {...props}
          />
          
          {error && (
            <p 
              id={`${inputId}-error`}
              className="mt-1 text-sm text-red-600"
              role="alert"
            >
              {error}
            </p>
          )}
          
          {helperText && !error && (
            <p 
              id={`${inputId}-helper`}
              className="mt-1 text-sm text-gray-500"
            >
              {helperText}
            </p>
          )}
        </div>
      </div>
    );
  }
);

DateTimePicker.displayName = 'DateTimePicker';

/**
 * 將本地時間轉換為 UTC+8 時區的 ISO 8601 格式
 * 用戶在 datetime-local 選擇的時間會被視為 UTC+8 時間
 * 
 * @param localDatetime datetime-local input 的值 (YYYY-MM-DDTHH:mm)
 * @returns UTC+8 時區的 ISO 8601 格式字串
 * 
 * @example
 * 用戶選擇: 2025-11-08T14:00 (希望是 UTC+8 下午2點)
 * 返回: 2025-11-08T14:00:00+08:00
 */
export const convertLocalToUTC = (localDatetime: string): string => {
  if (!localDatetime) return '';
  
  // 將用戶選擇的時間視為 UTC+8 時區
  // 格式：2025-11-08T14:00 → 2025-11-08T14:00:00+08:00
  return `${localDatetime}:00+08:00`;
};

/**
 * 將 ISO 8601 格式轉換為本地 datetime-local 格式
 * @param utcDatetime ISO 8601 格式字串（可能包含時區信息）
 * @returns datetime-local input 的值 (YYYY-MM-DDTHH:mm)
 * 
 * @example
 * 輸入: 2025-11-08T14:00:00+08:00 或 2025-11-08T06:00:00Z
 * 輸出: 2025-11-08T14:00 (UTC+8 時間)
 */
export const convertUTCToLocal = (utcDatetime: string): string => {
  if (!utcDatetime) return '';
  
  const date = new Date(utcDatetime);
  
  // 轉換為 UTC+8 時區（加 8 小時）
  const utc8Date = new Date(date.getTime() + (8 * 60 * 60 * 1000));
  
  // 格式化為 YYYY-MM-DDTHH:mm
  const year = utc8Date.getUTCFullYear();
  const month = String(utc8Date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(utc8Date.getUTCDate()).padStart(2, '0');
  const hours = String(utc8Date.getUTCHours()).padStart(2, '0');
  const minutes = String(utc8Date.getUTCMinutes()).padStart(2, '0');
  
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};
