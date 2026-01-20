/**
 * Test fixtures for fungible tokens
 */
import type { TokenBalance } from '@gala-chain/connect';
import type { FungibleTokenDisplay } from '@shared/types/display';
import BigNumber from 'bignumber.js';

// Mock TokenBalance objects (from GalaChain API)
export const mockTokenBalances: TokenBalance[] = [
  {
    collection: 'GALA',
    category: 'Currency',
    type: 'GALA',
    additionalKey: '',
    instanceIds: [new BigNumber(0)],
    quantity: new BigNumber('1500000000000'),
    lockedHolds: [],
    inUseHolds: [],
  } as unknown as TokenBalance,
  {
    collection: 'SILK',
    category: 'Currency',
    type: 'SILK',
    additionalKey: '',
    instanceIds: [new BigNumber(0)],
    quantity: new BigNumber('250000000'),
    lockedHolds: [
      { quantity: new BigNumber('50000000'), name: 'Staking', instanceId: new BigNumber(0) },
    ],
    inUseHolds: [],
  } as unknown as TokenBalance,
  {
    collection: 'GYRI',
    category: 'Utility',
    type: 'GYRI',
    additionalKey: '',
    instanceIds: [new BigNumber(0)],
    quantity: new BigNumber('100'),
    lockedHolds: [],
    inUseHolds: [
      { quantity: new BigNumber('25'), name: 'In Game', instanceId: new BigNumber(0) },
    ],
  } as unknown as TokenBalance,
];

// Single token for simple tests
export const mockGalaToken: TokenBalance = mockTokenBalances[0];
export const mockSilkToken: TokenBalance = mockTokenBalances[1];
export const mockGyriToken: TokenBalance = mockTokenBalances[2];

// Mock FungibleTokenDisplay objects (UI display format)
export const mockTokenDisplays: FungibleTokenDisplay[] = [
  {
    tokenKey: 'GALA|Currency|GALA|',
    collection: 'GALA',
    category: 'Currency',
    type: 'GALA',
    additionalKey: '',
    name: 'GALA Token',
    symbol: 'GALA',
    description: 'The native token of GalaChain',
    image: 'https://example.com/gala.png',
    decimals: 8,
    balanceRaw: '1500000000000',
    balanceFormatted: '15,000.00',
    lockedBalanceRaw: '0',
    lockedBalanceFormatted: '0.00',
    spendableBalanceRaw: '1500000000000',
    spendableBalanceFormatted: '15,000.00',
    canMint: false,
    canBurn: false,
  },
  {
    tokenKey: 'SILK|Currency|SILK|',
    collection: 'SILK',
    category: 'Currency',
    type: 'SILK',
    additionalKey: '',
    name: 'SILK Token',
    symbol: 'SILK',
    description: 'Spider Tanks SILK token',
    image: 'https://example.com/silk.png',
    decimals: 8,
    balanceRaw: '250000000',
    balanceFormatted: '2.50',
    lockedBalanceRaw: '50000000',
    lockedBalanceFormatted: '0.50',
    spendableBalanceRaw: '200000000',
    spendableBalanceFormatted: '2.00',
    canMint: true,
    canBurn: false,
    mintAllowanceRaw: '100000000000',
    mintAllowanceFormatted: '1,000.00',
  },
  {
    tokenKey: 'GYRI|Utility|GYRI|',
    collection: 'GYRI',
    category: 'Utility',
    type: 'GYRI',
    additionalKey: '',
    name: 'GYRI Token',
    symbol: 'GYRI',
    description: 'A utility token',
    image: '',
    decimals: 0,
    balanceRaw: '100',
    balanceFormatted: '100',
    lockedBalanceRaw: '0',
    lockedBalanceFormatted: '0',
    spendableBalanceRaw: '75',
    spendableBalanceFormatted: '75',
    canMint: false,
    canBurn: true,
  },
];

// Single display objects for simple tests
export const mockGalaDisplay: FungibleTokenDisplay = mockTokenDisplays[0];
export const mockSilkDisplay: FungibleTokenDisplay = mockTokenDisplays[1];
export const mockGyriDisplay: FungibleTokenDisplay = mockTokenDisplays[2];

// Token with mint authority
export const mockMintableToken: FungibleTokenDisplay = {
  ...mockSilkDisplay,
  canMint: true,
  mintAllowanceRaw: '1000000000000',
  mintAllowanceFormatted: '10,000.00',
};

// Token with burn authority
export const mockBurnableToken: FungibleTokenDisplay = {
  ...mockGyriDisplay,
  canBurn: true,
};

// Token with zero balance
export const mockZeroBalanceToken: FungibleTokenDisplay = {
  tokenKey: 'TEST|Currency|ZERO|',
  collection: 'TEST',
  category: 'Currency',
  type: 'ZERO',
  additionalKey: '',
  name: 'Zero Balance Token',
  symbol: 'ZERO',
  description: 'Token with no balance',
  image: '',
  decimals: 8,
  balanceRaw: '0',
  balanceFormatted: '0.00',
  lockedBalanceRaw: '0',
  lockedBalanceFormatted: '0.00',
  spendableBalanceRaw: '0',
  spendableBalanceFormatted: '0.00',
  canMint: false,
  canBurn: false,
};

// Factory functions for creating test tokens
export function createMockTokenDisplay(
  overrides: Partial<FungibleTokenDisplay> = {},
): FungibleTokenDisplay {
  return {
    ...mockGalaDisplay,
    ...overrides,
  };
}

export function createMockTokenBalance(
  overrides: Partial<Omit<TokenBalance, 'quantity' | 'instanceIds'>> & {
    quantity?: number | string;
  } = {},
): TokenBalance {
  const { quantity, ...rest } = overrides;
  return {
    collection: 'TEST',
    category: 'Currency',
    type: 'TEST',
    additionalKey: '',
    instanceIds: [new BigNumber(0)],
    quantity: new BigNumber(quantity ?? '1000000000000'),
    lockedHolds: [],
    inUseHolds: [],
    ...rest,
  } as unknown as TokenBalance;
}
