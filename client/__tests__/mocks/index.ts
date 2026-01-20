/**
 * Test mocks index - exports all mock modules for tests
 */

// GalaChain Connect mocks
export * from './galachain-connect';

// GalaChain Client mocks
export * from './galachain-client';

// Wallet store mocks
export * from './wallet-store';

// useGalaChain composable mocks
export * from './use-galachain';

/**
 * Common test setup utilities
 */
import { vi } from 'vitest';

/**
 * Mock HTMLDialogElement methods for jsdom
 * Call this in beforeAll() when testing dialog components
 */
export function mockDialogElement(): void {
  HTMLDialogElement.prototype.showModal = vi.fn();
  HTMLDialogElement.prototype.close = vi.fn();
  HTMLDialogElement.prototype.show = vi.fn();
}

/**
 * Mock window.matchMedia for responsive tests
 */
export function mockMatchMedia(matches = false): void {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
      matches,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

/**
 * Mock IntersectionObserver for lazy loading tests
 */
export function mockIntersectionObserver(): void {
  const mockIntersectionObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }));
  window.IntersectionObserver = mockIntersectionObserver;
}

/**
 * Mock ResizeObserver for responsive component tests
 */
export function mockResizeObserver(): void {
  const mockResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }));
  window.ResizeObserver = mockResizeObserver;
}

/**
 * Mock crypto.getRandomValues for unique key generation
 */
export function mockCrypto(): void {
  Object.defineProperty(globalThis, 'crypto', {
    value: {
      getRandomValues: vi.fn((array: Uint8Array) => {
        for (let i = 0; i < array.length; i++) {
          array[i] = Math.floor(Math.random() * 256);
        }
        return array;
      }),
      randomUUID: vi.fn().mockReturnValue('test-uuid-1234-5678-abcd-efgh'),
    },
  });
}

/**
 * Reset all mocks to default state
 */
export function resetAllMocks(): void {
  vi.clearAllMocks();
}
