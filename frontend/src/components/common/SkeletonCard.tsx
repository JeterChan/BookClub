/**
 * SkeletonCard - Loading placeholder component
 * Displays animated skeleton while data is loading
 */
export const SkeletonCard = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
      <div className="space-y-4">
        <div className="h-6 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
      </div>
    </div>
  );
};

/**
 * SkeletonLine - Single skeleton line
 */
export const SkeletonLine = ({ width = 'full' }: { width?: 'full' | '3/4' | '1/2' | '1/4' }) => {
  return <div className={`h-4 bg-gray-200 rounded w-${width} animate-pulse`}></div>;
};

/**
 * SkeletonCircle - Circular skeleton (for avatars)
 */
export const SkeletonCircle = ({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' | 'xl' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };

  return (
    <div className={`${sizeClasses[size]} bg-gray-200 rounded-full animate-pulse`}></div>
  );
};
