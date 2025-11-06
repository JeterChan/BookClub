import { forwardRef, useId } from 'react';
import type { InputHTMLAttributes } from 'react';
import { clsx } from 'clsx';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className, ...props }, ref) => {
    console.log("Input error prop:", error);
    const id = useId();
    const inputId = props.id || id;

    return (
      <div className="w-full">
        {label && (
          <label 
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        
        <div className="relative min-h-[calc(theme(spacing.12)+theme(spacing.6))]">
          <input
            id={inputId}
            ref={ref}
            className={clsx(
              'w-full px-4 py-2.5 border-2 rounded-xl transition-all',
              'focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent',
              error
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300',
              props.disabled && 'bg-gray-100 cursor-not-allowed opacity-60',
              className
            )}
            aria-invalid={!!error}
            aria-describedby={
              error ? `${props.name}-error` : helperText ? `${props.name}-helper` : undefined
            }
            {...props}
          />
          
          {error && (
            <p
              id={`${props.name}-error`}
              role="alert"
              className="mt-1 text-sm text-red-600"
            >
              {error}
            </p>
          )}
          
          {!error && helperText && (
            <p
              id={`${props.name}-helper`}
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

Input.displayName = 'Input';
