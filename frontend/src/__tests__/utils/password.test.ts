import { describe, it, expect } from 'vitest';
import { calculatePasswordStrength } from '../../utils/password';

describe('passwordUtils', () => {
  describe('calculatePasswordStrength', () => {
    it('should return "weak" for short passwords', () => {
      expect(calculatePasswordStrength('12345')).toBe('weak');
    });

    it('should return "medium" for decent length but low complexity', () => {
      // Length 8 (1pt) + Digits (1pt) = 2pts -> weak
      // Let's try better: Length 8 (1pt) + Lower/Upper (1pt) + Digits (1pt) = 3pts -> medium
      expect(calculatePasswordStrength('Pass1234')).toBe('medium');
    });

    it('should return "strong" for long and complex passwords', () => {
      // Length 12 (2pts) + Lower/Upper (1pt) + Digits (1pt) + Symbol (1pt) = 5pts -> strong
      expect(calculatePasswordStrength('StrongPass123!')).toBe('strong');
    });

    it('should correctly identify weak passwords based on criteria', () => {
      expect(calculatePasswordStrength('')).toBe('weak');
      expect(calculatePasswordStrength('abcdefg')).toBe('weak');
    });
  });
});
