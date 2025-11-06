import type { TextareaHTMLAttributes } from 'react';
import { forwardRef } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  showCharCount?: boolean;
  currentLength?: number;
}

/**
 * Textarea - Multi-line text input component
 * Supports error states, labels, and character count
 */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, showCharCount, currentLength, maxLength, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {label}
          </label>
        )}
        
        <textarea
          ref={ref}
          className={`
            w-full px-4 py-2.5 border-2 rounded-xl
            focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all
            disabled:bg-gray-100 disabled:cursor-not-allowed
            ${error ? 'border-red-500' : 'border-gray-300'}
            ${className}
          `}
          {...props}
        />
        
        <div className="flex items-center justify-between mt-1">
          <div>
            {error && (
              <p className="text-sm text-red-600" role="alert">
                {error}
              </p>
            )}
          </div>
          
          {showCharCount && maxLength && (
            <p className={`text-sm ${currentLength && currentLength > maxLength ? 'text-red-600' : 'text-gray-500'}`}>
              {currentLength || 0} / {maxLength}
            </p>
          )}
        </div>
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
