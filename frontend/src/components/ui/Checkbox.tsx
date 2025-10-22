import { forwardRef, InputHTMLAttributes, ReactNode } from 'react';
import { clsx } from 'clsx';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  children?: ReactNode;
  error?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ children, error, className, ...props }, ref) => {
    return (
      <div className="flex flex-col">
        <label className="flex items-start gap-2 cursor-pointer">
          <input
            ref={ref}
            type="checkbox"
            className={clsx(
              'mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded',
              'focus:ring-2 focus:ring-blue-500 cursor-pointer',
              error && 'border-red-500',
              className
            )}
            aria-invalid={!!error}
            {...props}
          />
          {children && (
            <span className="text-sm text-gray-700 select-none">
              {children}
            </span>
          )}
        </label>
        {error && (
          <p role="alert" className="mt-1 text-sm text-red-600 ml-6">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';
