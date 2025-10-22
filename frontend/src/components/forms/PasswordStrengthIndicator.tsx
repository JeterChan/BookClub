import { useMemo } from 'react';
import { clsx } from 'clsx';

export type PasswordStrength = 'weak' | 'medium' | 'strong';

export interface PasswordStrengthIndicatorProps {
  password: string;
}

export const calculatePasswordStrength = (password: string): PasswordStrength => {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;
  
  if (score <= 2) return 'weak';
  if (score <= 4) return 'medium';
  return 'strong';
};

export const PasswordStrengthIndicator = ({ password }: PasswordStrengthIndicatorProps) => {
  const strength = useMemo(() => {
    if (!password) return null;
    return calculatePasswordStrength(password);
  }, [password]);

  if (!strength) return null;

  const config = {
    weak: {
      label: '弱',
      color: 'bg-red-500',
      width: 'w-1/3',
      textColor: 'text-red-600'
    },
    medium: {
      label: '中',
      color: 'bg-yellow-500',
      width: 'w-2/3',
      textColor: 'text-yellow-600'
    },
    strong: {
      label: '強',
      color: 'bg-green-500',
      width: 'w-full',
      textColor: 'text-green-600'
    }
  };

  const { label, color, width, textColor } = config[strength];

  return (
    <div className="mt-2">
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs text-gray-600">密碼強度</span>
        <span className={clsx('text-xs font-semibold', textColor)}>
          {label}
        </span>
      </div>
      <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={clsx('h-full transition-all duration-300', color, width)}
        />
      </div>
    </div>
  );
};
