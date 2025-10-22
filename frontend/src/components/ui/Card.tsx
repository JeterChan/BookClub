import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

/**
 * Card - Reusable card container component
 * Provides consistent styling for content cards
 */
export const Card = ({ children, className = '', onClick }: CardProps) => {
  const baseClasses = 'bg-white rounded-lg shadow-sm border border-gray-200 p-6';
  const hoverClasses = onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : '';
  
  return (
    <div 
      className={`${baseClasses} ${hoverClasses} ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {children}
    </div>
  );
};
