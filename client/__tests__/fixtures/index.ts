/**
 * Test fixtures index - exports all mock data for tests
 */

// Token fixtures
export * from './tokens';

// NFT fixtures
export * from './nfts';

// Collection fixtures
export * from './collections';

// Allowance fixtures
export * from './allowances';

// Common test wallet address
export const TEST_WALLET_ADDRESS = 'client|0x1234567890abcdef1234567890abcdef12345678';
export const TEST_ETH_ADDRESS = 'eth|0x1234567890abcdef1234567890abcdef12345678';
export const TEST_HEX_ADDRESS = '0x1234567890abcdef1234567890abcdef12345678';

// Common test user aliases
export const TEST_GRANTOR = 'client|0xauthorityaabbccdd';
export const TEST_GRANTEE = 'client|0xrecipient11223344';
