/**
 * Format a date to relative time (e.g., "3小時前", "昨天")
 * @param dateString ISO 8601 date string (UTC time from backend)
 * @returns Formatted relative time string
 */
export const formatRelativeTime = (dateString: string): string => {
  // Parse the date string as UTC
  // If the string doesn't end with 'Z', add it to ensure it's treated as UTC
  const utcDateString = dateString.endsWith('Z') ? dateString : `${dateString}Z`;
  const date = new Date(utcDateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) {
    return '剛剛';
  } else if (diffMin < 60) {
    return `${diffMin}分鐘前`;
  } else if (diffHour < 24) {
    return `${diffHour}小時前`;
  } else if (diffDay === 1) {
    return '昨天';
  } else if (diffDay < 7) {
    return `${diffDay}天前`;
  } else if (diffDay < 30) {
    const weeks = Math.floor(diffDay / 7);
    return `${weeks}週前`;
  } else if (diffDay < 365) {
    const months = Math.floor(diffDay / 30);
    return `${months}個月前`;
  } else {
    const years = Math.floor(diffDay / 365);
    return `${years}年前`;
  }
};

/**
 * Format a date to full date string (e.g., "2025年10月20日")
 * @param dateString ISO 8601 date string (UTC time from backend)
 * @returns Formatted full date string in local timezone
 */
export const formatFullDate = (dateString: string): string => {
  const utcDateString = dateString.endsWith('Z') ? dateString : `${dateString}Z`;
  const date = new Date(utcDateString);
  return date.toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * Format a date to short date string (e.g., "2025/10/20")
 * @param dateString ISO 8601 date string (UTC time from backend)
 * @returns Formatted short date string in local timezone
 */
export const formatShortDate = (dateString: string): string => {
  const utcDateString = dateString.endsWith('Z') ? dateString : `${dateString}Z`;
  const date = new Date(utcDateString);
  return date.toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
};

/**
 * Format a date to date with time (e.g., "2025年10月20日 14:22")
 * @param dateString ISO 8601 date string (UTC time from backend)
 * @returns Formatted date with time string in local timezone
 */
export const formatDateTime = (dateString: string): string => {
  const utcDateString = dateString.endsWith('Z') ? dateString : `${dateString}Z`;
  const date = new Date(utcDateString);
  return date.toLocaleString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};
