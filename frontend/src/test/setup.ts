import '@testing-library/jest-dom';
import { vi } from 'vitest';
import 'allure-vitest/setup';

// Mock react-hot-toast globally
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
    promise: vi.fn(),
  },
  Toaster: () => null,
}));