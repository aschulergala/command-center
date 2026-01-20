/**
 * Mock for @/composables/useGalaChain
 *
 * Usage in tests:
 * ```ts
 * vi.mock('@/composables/useGalaChain', () => mockUseGalaChainModule)
 * ```
 */
import { vi } from 'vitest';
import { ref, computed } from 'vue';
import type { TokenBalance } from '@gala-chain/connect';
import type { TokenAllowance } from '@gala-chain/api';

/**
 * Mock state for useGalaChain composable
 */
export const mockGalaChainState = {
  isLoading: ref(false),
  error: ref<Error | null>(null),
};

/**
 * Reset mock state
 */
export function resetMockGalaChainState(): void {
  mockGalaChainState.isLoading.value = false;
  mockGalaChainState.error.value = null;
}

/**
 * Mock operation result type
 */
export type MockOperationResult<T> =
  | { success: true; data: T }
  | { success: false; error: Error };

/**
 * Mock action implementations
 */
export const mockGetBalances = vi.fn<[string], Promise<MockOperationResult<TokenBalance[]>>>().mockResolvedValue({
  success: true,
  data: [],
});

export const mockGetAllowances = vi.fn<[string], Promise<MockOperationResult<TokenAllowance[]>>>().mockResolvedValue({
  success: true,
  data: [],
});

export const mockTransferToken = vi.fn<[any, string, string], Promise<MockOperationResult<TokenBalance[]>>>().mockResolvedValue({
  success: true,
  data: [],
});

export const mockMintToken = vi.fn<[any, string], Promise<MockOperationResult<TokenBalance[]>>>().mockResolvedValue({
  success: true,
  data: [],
});

export const mockBurnTokens = vi.fn<[any[]], Promise<MockOperationResult<TokenBalance[]>>>().mockResolvedValue({
  success: true,
  data: [],
});

/**
 * Reset all mock functions
 */
export function resetMockUseGalaChain(): void {
  resetMockGalaChainState();
  mockGetBalances.mockReset().mockResolvedValue({ success: true, data: [] });
  mockGetAllowances.mockReset().mockResolvedValue({ success: true, data: [] });
  mockTransferToken.mockReset().mockResolvedValue({ success: true, data: [] });
  mockMintToken.mockReset().mockResolvedValue({ success: true, data: [] });
  mockBurnTokens.mockReset().mockResolvedValue({ success: true, data: [] });
}

/**
 * Mock useGalaChain composable function
 */
export const mockUseGalaChain = vi.fn(() => ({
  // State
  isLoading: mockGalaChainState.isLoading,
  error: mockGalaChainState.error,

  // Computed
  isConnected: computed(() => true),
  walletAddress: computed(() => 'client|0x1234567890abcdef'),
  config: computed(() => ({
    env: 'stage',
    gatewayUrl: 'https://gateway.galachain.com',
    apiUrl: 'https://api.galachain.com',
  })),

  // Actions
  getBalances: mockGetBalances,
  getAllowances: mockGetAllowances,
  transferToken: mockTransferToken,
  mintToken: mockMintToken,
  burnTokens: mockBurnTokens,
}));

/**
 * Default mock implementation for useGalaChain module
 */
export const mockUseGalaChainModule = {
  useGalaChain: mockUseGalaChain,
};

/**
 * Configure mock to return specific balances
 */
export function setMockGetBalancesResult(balances: TokenBalance[]): void {
  mockGetBalances.mockResolvedValue({ success: true, data: balances });
}

/**
 * Configure mock getBalances to fail
 */
export function setMockGetBalancesError(error: Error | string): void {
  const err = typeof error === 'string' ? new Error(error) : error;
  mockGetBalances.mockResolvedValue({ success: false, error: err });
}

/**
 * Configure mock to return specific allowances
 */
export function setMockGetAllowancesResult(allowances: TokenAllowance[]): void {
  mockGetAllowances.mockResolvedValue({ success: true, data: allowances });
}

/**
 * Configure mock transferToken to succeed
 */
export function setMockTransferSuccess(resultBalances: TokenBalance[] = []): void {
  mockTransferToken.mockResolvedValue({ success: true, data: resultBalances });
}

/**
 * Configure mock transferToken to fail
 */
export function setMockTransferError(error: Error | string): void {
  const err = typeof error === 'string' ? new Error(error) : error;
  mockTransferToken.mockResolvedValue({ success: false, error: err });
}

/**
 * Configure mock mintToken to succeed
 */
export function setMockMintSuccess(resultBalances: TokenBalance[] = []): void {
  mockMintToken.mockResolvedValue({ success: true, data: resultBalances });
}

/**
 * Configure mock mintToken to fail
 */
export function setMockMintError(error: Error | string): void {
  const err = typeof error === 'string' ? new Error(error) : error;
  mockMintToken.mockResolvedValue({ success: false, error: err });
}

/**
 * Configure mock burnTokens to succeed
 */
export function setMockBurnSuccess(resultBalances: TokenBalance[] = []): void {
  mockBurnTokens.mockResolvedValue({ success: true, data: resultBalances });
}

/**
 * Configure mock burnTokens to fail
 */
export function setMockBurnError(error: Error | string): void {
  const err = typeof error === 'string' ? new Error(error) : error;
  mockBurnTokens.mockResolvedValue({ success: false, error: err });
}
