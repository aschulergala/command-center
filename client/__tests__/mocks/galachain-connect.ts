/**
 * Mock for @gala-chain/connect module
 *
 * Usage in tests:
 * ```ts
 * vi.mock('@gala-chain/connect', () => mockGalaChainConnect)
 * ```
 */
import { vi } from 'vitest';

/**
 * Mock BrowserConnectClient class
 */
export class MockBrowserConnectClient {
  connect = vi.fn().mockResolvedValue('client|0x1234567890abcdef');
  disconnect = vi.fn();
  getPublicKey = vi.fn().mockResolvedValue('mock-public-key');
  on = vi.fn().mockReturnThis();
  off = vi.fn().mockReturnThis();
  send = vi.fn().mockResolvedValue({ Data: {} });
  evaluate = vi.fn().mockResolvedValue({ Data: {} });
  submit = vi.fn().mockResolvedValue({ Data: {} });
}

/**
 * Mock TokenApi class
 */
export class MockTokenApi {
  FetchBalances = vi.fn().mockResolvedValue({ Data: [] });
  FetchAllowances = vi.fn().mockResolvedValue({ Data: { results: [] } });
  TransferToken = vi.fn().mockResolvedValue({ Data: [] });
  MintToken = vi.fn().mockResolvedValue({ Data: [] });
  BurnTokens = vi.fn().mockResolvedValue({ Data: [] });
  CreateTokenClass = vi.fn().mockResolvedValue({ Data: {} });
}

/**
 * Default mock implementation for @gala-chain/connect
 */
export const mockGalaChainConnect = {
  BrowserConnectClient: MockBrowserConnectClient,
  TokenApi: MockTokenApi,
};

/**
 * Factory to create a fresh mock client for each test
 */
export function createMockBrowserConnectClient(): MockBrowserConnectClient {
  return new MockBrowserConnectClient();
}

/**
 * Factory to create a fresh mock TokenApi for each test
 */
export function createMockTokenApi(): MockTokenApi {
  return new MockTokenApi();
}

/**
 * Mock client instance with pre-configured address
 */
export const mockConnectedClient = {
  instance: createMockBrowserConnectClient(),
  address: 'client|0x1234567890abcdef1234567890abcdef12345678',
  publicKey: 'mock-public-key-abcdef123456',
};
