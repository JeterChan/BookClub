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

    // 取得當前時間（本地時區）
    const now = new Date();
    const minDateTime = disablePast
      ? now.toISOString().slice(0, 16) // YYYY-MM-DDTHH:mm 格式
      : undefined;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      // 將本地時間轉換為 UTC ISO 8601 格式
      const localDatetime = e.target.value;
      if (localDatetime) {
        const date = new Date(localDatetime);
        // 可以在這裡驗證是否為未來時間
        if (disablePast && date <= now) {
          return; // 不觸發 onChange
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
 * 將本地時間轉換為 UTC ISO 8601 格式
 * @param localDatetime datetime-local input 的值 (YYYY-MM-DDTHH:mm)
 * @returns UTC ISO 8601 格式字串
 */
export const convertLocalToUTC = (localDatetime: string): string => {
  if (!localDatetime) return '';
  const date = new Date(localDatetime);
  return date.toISOString();
};

/**
 * 將 UTC ISO 8601 格式轉換為本地時間
 * @param utcDatetime UTC ISO 8601 格式字串
 * @returns datetime-local input 的值 (YYYY-MM-DDTHH:mm)
 */
export const convertUTCToLocal = (utcDatetime: string): string => {
  if (!utcDatetime) return '';
  const date = new Date(utcDatetime);
  // 轉換為本地時區的 YYYY-MM-DDTHH:mm 格式
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};
