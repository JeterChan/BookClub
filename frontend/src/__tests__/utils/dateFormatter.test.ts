import { describe, it, expect } from 'vitest';
import { formatRelativeTime, formatFullDate, formatShortDate, formatDateTime } from '../../utils/dateFormatter';

describe('dateFormatter', () => {
  const now = new Date();
  
  describe('formatRelativeTime', () => {
    it('should return "剛剛" for times less than 60 seconds ago', () => {
      const secondsAgo = new Date(now.getTime() - 30 * 1000).toISOString();
      expect(formatRelativeTime(secondsAgo)).toBe('剛剛');
    });

    it('should return minutes ago correctly', () => {
      const minutesAgo = new Date(now.getTime() - 5 * 60 * 1000).toISOString();
      expect(formatRelativeTime(minutesAgo)).toBe('5分鐘前');
    });

    it('should return hours ago correctly', () => {
      const hoursAgo = new Date(now.getTime() - 3 * 60 * 60 * 1000).toISOString();
      expect(formatRelativeTime(hoursAgo)).toBe('3小時前');
    });

    it('should return "昨天" correctly', () => {
      const yesterday = new Date(now.getTime() - 25 * 60 * 60 * 1000).toISOString();
      expect(formatRelativeTime(yesterday)).toBe('昨天');
    });

    it('should return days ago correctly', () => {
      const daysAgo = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString();
      expect(formatRelativeTime(daysAgo)).toBe('5天前');
    });

    it('should return weeks ago correctly', () => {
      const weeksAgo = new Date(now.getTime() - 2 * 7 * 24 * 60 * 60 * 1000).toISOString();
      expect(formatRelativeTime(weeksAgo)).toBe('2週前');
    });

    it('should return months ago correctly', () => {
      const monthsAgo = new Date(now.getTime() - 35 * 24 * 60 * 60 * 1000).toISOString();
      expect(formatRelativeTime(monthsAgo)).toBe('1個月前');
    });

    it('should return years ago correctly', () => {
      const yearsAgo = new Date(now.getTime() - 370 * 24 * 60 * 60 * 1000).toISOString();
      expect(formatRelativeTime(yearsAgo)).toBe('1年前');
    });
  });

  describe('DateFormatting', () => {
    // Using a fixed date for consistent testing
    // 2023-10-20 14:22:00 UTC
    const fixedDate = '2023-10-20T14:22:00Z';

    it('formatFullDate should format correctly', () => {
      // The output depends on locale, but we expect something like "2023年10月20日"
      // We check if it contains the key parts
      const formatted = formatFullDate(fixedDate);
      expect(formatted).toMatch(/2023/);
      expect(formatted).toMatch(/10/);
      expect(formatted).toMatch(/20/);
    });

    it('formatShortDate should format correctly', () => {
      const formatted = formatShortDate(fixedDate);
      expect(formatted).toMatch(/2023\/10\/20/);
    });
  });
});
