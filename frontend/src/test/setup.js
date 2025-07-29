// Test setup for Vitest
import '@testing-library/jest-dom';
import { expect, afterEach, beforeEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// Cleanup after each test case
afterEach(() => {
  cleanup();
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock ResizeObserver
globalThis.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock IntersectionObserver
globalThis.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock scrollTo for testing scroll behavior
Object.defineProperty(Element.prototype, 'scrollTo', {
  writable: true,
  value: vi.fn(),
});

Object.defineProperty(Element.prototype, 'scrollIntoView', {
  writable: true,
  value: vi.fn(),
});

// Mock fetch for API testing
globalThis.fetch = vi.fn();

// Mock console methods to reduce noise in tests
globalThis.console = {
  ...console,
  log: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  info: vi.fn(),
  debug: vi.fn(),
};

// Setup custom matchers
expect.extend({
  toHaveBeenCalledWithMessage(received, message) {
    const calls = received.mock.calls;
    const messageFound = calls.some(call => 
      call.some(arg => 
        typeof arg === 'object' && 
        arg !== null && 
        'message' in arg && 
        arg.message === message
      )
    );

    return {
      message: () => 
        `expected fetch to have been called with message "${message}"`,
      pass: messageFound,
    };
  },
});

// Global test utilities
export const createMockMessage = (overrides = {}) => ({
  id: `msg_${Date.now()}_${Math.random()}`,
  content: 'Test message',
  sender: 'user',
  timestamp: new Date().toISOString(),
  status: 'sent',
  ...overrides,
});

export const createMockResponse = (response = 'Test response') => ({
  response,
});

export const mockApiSuccess = (response = 'Test response') => {
  globalThis.fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => createMockResponse(response),
  });
};

export const mockApiError = (message = 'Server Error') => {
  globalThis.fetch.mockRejectedValueOnce(new Error(message));
};

// Reset all mocks before each test
beforeEach(() => {
  vi.clearAllMocks();
});
