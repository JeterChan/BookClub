import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock react-hot-toast globally
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
    promise: vi.fn(),
  },
}));
