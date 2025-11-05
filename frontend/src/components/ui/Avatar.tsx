import { getAvatarUrl } from '../../services/profileService';

interface AvatarProps {
  src?: string | null;
  alt: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  bustCache?: boolean; // Add cache busting option
}

/**
 * Avatar - User avatar component with fallback
 * Displays user image or initials
 */
export const Avatar = ({ src, alt, size = 'md', bustCache = false }: AvatarProps) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-12 h-12 text-base',
    lg: 'w-16 h-16 text-lg',
    xl: 'w-24 h-24 text-2xl',
  };

  // Get initials from name for fallback
  const getInitials = (name: string): string => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const initials = getInitials(alt);
  const avatarUrl = src ? getAvatarUrl(src, bustCache) : null;

  return (
    <div className={`${sizeClasses[size]} rounded-full overflow-hidden flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600 text-white font-semibold`}>
      {avatarUrl ? (
        <img 
          key={avatarUrl} // Force re-render when URL changes
          src={avatarUrl} 
          alt={alt} 
          className="w-full h-full object-cover"
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
        />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
};
