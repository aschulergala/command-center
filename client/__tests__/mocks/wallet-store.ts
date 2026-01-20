/**
 * Mock for wallet store (@/stores/wallet)
 *
 * Usage in tests:
 * ```ts
 * vi.mock('@/stores/wallet', () => mockWalletStore)
 * ```
 */
import { vi } from 'vitest';
import { ref, computed } from 'vue';
import type { WalletConnectionStatus } from '@shared/types/wallet';

/**
 * Mock wallet state - can be modified in tests
 */
export const mockWalletState = {
  connected: ref(false),
  address: ref<string | null>(null),
  publicKey: ref<string | null>(null),
  isConnecting: ref(false),
  error: ref<string | null>(null),
};

/**
 * Reset mock wallet state to disconnected
 */
export function resetMockWalletState(): void {
  mockWalletState.connected.value = false;
  mockWalletState.address.value = null;
  mockWalletState.publicKey.value = null;
  mockWalletState.isConnecting.value = false;
  mockWalletState.error.value = null;
}

/**
 * Set mock wallet to connected state
 */
export function setMockWalletConnected(
  address = 'client|0x1234567890abcdef1234567890abcdef12345678',
  publicKey = 'mock-public-key-abcdef123456',
): void {
  mockWalletState.connected.value = true;
  mockWalletState.address.value = address;
  mockWalletState.publicKey.value = publicKey;
  mockWalletState.isConnecting.value = false;
  mockWalletState.error.value = null;
}

/**
 * Set mock wallet to error state
 */
export function setMockWalletError(error: string): void {
  mockWalletState.connected.value = false;
  mockWalletState.address.value = null;
  mockWalletState.isConnecting.value = false;
  mockWalletState.error.value = error;
}

/**
 * Mock useWalletStore function
 */
export const mockUseWalletStore = vi.fn(() => ({
  // State
  connected: mockWalletState.connected.value,
  address: mockWalletState.address.value,
  publicKey: mockWalletState.publicKey.value,
  isConnecting: mockWalletState.isConnecting.value,
  error: mockWalletState.error.value,

  // Getters
  status: computed(() =>
    mockWalletState.connected.value
      ? ('connected' as WalletConnectionStatus)
      : ('disconnected' as WalletConnectionStatus),
  ),
  truncatedAddress: computed(() => {
    const addr = mockWalletState.address.value;
    if (!addr) return '';
    return addr.length > 16 ? `${addr.slice(0, 8)}...${addr.slice(-6)}` : addr;
  }),
  state: computed(() => ({
    connected: mockWalletState.connected.value,
    address: mockWalletState.address.value,
    publicKey: mockWalletState.publicKey.value,
    isConnecting: mockWalletState.isConnecting.value,
    error: mockWalletState.error.value,
  })),

  // Actions
  connect: vi.fn().mockResolvedValue(undefined),
  disconnect: vi.fn(),
  checkConnection: vi.fn().mockResolvedValue(false),
  clearError: vi.fn(),
  getClient: vi.fn().mockReturnValue(null),
}));

/**
 * Default mock implementation for wallet store module
 */
export const mockWalletStore = {
  useWalletStore: mockUseWalletStore,
};

/**
 * Create a mock wallet store with custom initial state
 */
export function createMockWalletStore(options: {
  connected?: boolean;
  address?: string | null;
  publicKey?: string | null;
  isConnecting?: boolean;
  error?: string | null;
} = {}): ReturnType<typeof mockUseWalletStore> {
  const store = mockUseWalletStore();

  // Override with provided options
  if (options.connected !== undefined) {
    (store as any).connected = options.connected;
  }
  if (options.address !== undefined) {
    (store as any).address = options.address;
  }
  if (options.publicKey !== undefined) {
    (store as any).publicKey = options.publicKey;
  }
  if (options.isConnecting !== undefined) {
    (store as any).isConnecting = options.isConnecting;
  }
  if (options.error !== undefined) {
    (store as any).error = options.error;
  }

  return store;
}
