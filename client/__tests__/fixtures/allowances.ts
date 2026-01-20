/**
 * Test fixtures for token allowances
 */
import { AllowanceType } from '@gala-chain/api';
import type { TokenAllowance } from '@gala-chain/api';
import type { AllowanceDisplay } from '@shared/types/display';
import BigNumber from 'bignumber.js';

// Mock TokenAllowance objects (from GalaChain API)
export const mockTokenAllowances: TokenAllowance[] = [
  {
    grantedTo: 'client|0x1234567890abcdef',
    grantedBy: 'client|0xauthority1111111',
    collection: 'SILK',
    category: 'Currency',
    type: 'SILK',
    additionalKey: '',
    instance: new BigNumber(0),
    allowanceType: AllowanceType.Mint,
    quantity: new BigNumber('1000000000000'),
    quantitySpent: new BigNumber('250000000000'),
    uses: new BigNumber(0),
    usesSpent: new BigNumber(0),
    expires: 0,
    created: Date.now(),
  } as unknown as TokenAllowance,
  {
    grantedTo: 'client|0x1234567890abcdef',
    grantedBy: 'client|0xauthority2222222',
    collection: 'GYRI',
    category: 'Utility',
    type: 'GYRI',
    additionalKey: '',
    instance: new BigNumber(0),
    allowanceType: AllowanceType.Burn,
    quantity: new BigNumber('5000'),
    quantitySpent: new BigNumber('1000'),
    uses: new BigNumber(0),
    usesSpent: new BigNumber(0),
    expires: 0,
    created: Date.now(),
  } as unknown as TokenAllowance,
  {
    grantedTo: 'client|0x1234567890abcdef',
    grantedBy: 'client|0xauthority3333333',
    collection: 'GALA',
    category: 'Currency',
    type: 'GALA',
    additionalKey: '',
    instance: new BigNumber(0),
    allowanceType: AllowanceType.Lock,
    quantity: new BigNumber('100000000000'),
    quantitySpent: new BigNumber('0'),
    uses: new BigNumber(10),
    usesSpent: new BigNumber(3),
    expires: Date.now() + 86400000, // 24 hours from now
    created: Date.now(),
  } as unknown as TokenAllowance,
];

// Expired allowance
export const mockExpiredAllowance: TokenAllowance = {
  grantedTo: 'client|0x1234567890abcdef',
  grantedBy: 'client|0xauthority4444444',
  collection: 'TEST',
  category: 'Currency',
  type: 'TEST',
  additionalKey: '',
  instance: new BigNumber(0),
  allowanceType: AllowanceType.Transfer,
  quantity: new BigNumber('1000'),
  quantitySpent: new BigNumber('0'),
  uses: new BigNumber(0),
  usesSpent: new BigNumber(0),
  expires: Date.now() - 86400000, // 24 hours ago (expired)
  created: Date.now() - 172800000,
} as unknown as TokenAllowance;

// NFT mint allowance (instance 0 = collection level)
export const mockNFTMintAllowance: TokenAllowance = {
  grantedTo: 'client|0x1234567890abcdef',
  grantedBy: 'client|0xauthority5555555',
  collection: 'MyCollection',
  category: 'Items',
  type: 'Sword',
  additionalKey: '',
  instance: new BigNumber(0),
  allowanceType: AllowanceType.Mint,
  quantity: new BigNumber('1000'),
  quantitySpent: new BigNumber('100'),
  uses: new BigNumber(0),
  usesSpent: new BigNumber(0),
  expires: 0,
  created: Date.now(),
} as unknown as TokenAllowance;

// Single allowances for simple tests
export const mockMintAllowance: TokenAllowance = mockTokenAllowances[0];
export const mockBurnAllowance: TokenAllowance = mockTokenAllowances[1];
export const mockLockAllowance: TokenAllowance = mockTokenAllowances[2];

// Mock AllowanceDisplay objects (UI display format)
export const mockAllowanceDisplays: AllowanceDisplay[] = [
  {
    allowanceKey: 'SILK|Currency|SILK||0|Mint',
    collection: 'SILK',
    category: 'Currency',
    type: 'SILK',
    additionalKey: '',
    instance: '0',
    allowanceType: AllowanceType.Mint,
    grantedBy: 'client|0xauthority1111111',
    grantedTo: 'client|0x1234567890abcdef',
    quantityRaw: '1000000000000',
    quantitySpentRaw: '250000000000',
    quantityRemainingRaw: '750000000000',
    quantityRemainingFormatted: '7,500.00',
    usesRaw: '0',
    usesSpentRaw: '0',
    expires: 0,
    isExpired: false,
    expiresFormatted: 'Never',
  },
  {
    allowanceKey: 'GYRI|Utility|GYRI||0|Burn',
    collection: 'GYRI',
    category: 'Utility',
    type: 'GYRI',
    additionalKey: '',
    instance: '0',
    allowanceType: AllowanceType.Burn,
    grantedBy: 'client|0xauthority2222222',
    grantedTo: 'client|0x1234567890abcdef',
    quantityRaw: '5000',
    quantitySpentRaw: '1000',
    quantityRemainingRaw: '4000',
    quantityRemainingFormatted: '4,000',
    usesRaw: '0',
    usesSpentRaw: '0',
    expires: 0,
    isExpired: false,
    expiresFormatted: 'Never',
  },
  {
    allowanceKey: 'GALA|Currency|GALA||0|Lock',
    collection: 'GALA',
    category: 'Currency',
    type: 'GALA',
    additionalKey: '',
    instance: '0',
    allowanceType: AllowanceType.Lock,
    grantedBy: 'client|0xauthority3333333',
    grantedTo: 'client|0x1234567890abcdef',
    quantityRaw: '100000000000',
    quantitySpentRaw: '0',
    quantityRemainingRaw: '100000000000',
    quantityRemainingFormatted: '1,000.00',
    usesRaw: '10',
    usesSpentRaw: '3',
    expires: Date.now() + 86400000,
    isExpired: false,
    expiresFormatted: 'In 24 hours',
  },
];

// Single display objects for simple tests
export const mockMintAllowanceDisplay: AllowanceDisplay = mockAllowanceDisplays[0];
export const mockBurnAllowanceDisplay: AllowanceDisplay = mockAllowanceDisplays[1];
export const mockLockAllowanceDisplay: AllowanceDisplay = mockAllowanceDisplays[2];

// Expired allowance display
export const mockExpiredAllowanceDisplay: AllowanceDisplay = {
  allowanceKey: 'TEST|Currency|TEST||0|Transfer',
  collection: 'TEST',
  category: 'Currency',
  type: 'TEST',
  additionalKey: '',
  instance: '0',
  allowanceType: AllowanceType.Transfer,
  grantedBy: 'client|0xauthority4444444',
  grantedTo: 'client|0x1234567890abcdef',
  quantityRaw: '1000',
  quantitySpentRaw: '0',
  quantityRemainingRaw: '1000',
  quantityRemainingFormatted: '1,000',
  usesRaw: '0',
  usesSpentRaw: '0',
  expires: Date.now() - 86400000,
  isExpired: true,
  expiresFormatted: 'Expired',
};

// Unlimited allowance
export const mockUnlimitedAllowance: TokenAllowance = {
  grantedTo: 'client|0x1234567890abcdef',
  grantedBy: 'client|0xauthority6666666',
  collection: 'UNLIMITED',
  category: 'Test',
  type: 'UNLIMITED',
  additionalKey: '',
  instance: new BigNumber(0),
  allowanceType: AllowanceType.Mint,
  quantity: new BigNumber('999999999999999999999999999999'),
  quantitySpent: new BigNumber('0'),
  uses: new BigNumber(0),
  usesSpent: new BigNumber(0),
  expires: 0,
  created: Date.now(),
} as unknown as TokenAllowance;

// Factory functions
export function createMockTokenAllowance(
  overrides: Partial<Omit<TokenAllowance, 'quantity' | 'quantitySpent' | 'instance'>> & {
    quantity?: number | string;
    quantitySpent?: number | string;
    instance?: number;
  } = {},
): TokenAllowance {
  const { quantity, quantitySpent, instance, ...rest } = overrides;
  return {
    grantedTo: 'client|0x1234567890abcdef',
    grantedBy: 'client|0xauthority0000000',
    collection: 'TEST',
    category: 'Currency',
    type: 'TEST',
    additionalKey: '',
    instance: new BigNumber(instance ?? 0),
    allowanceType: AllowanceType.Mint,
    quantity: new BigNumber(quantity ?? '1000000000000'),
    quantitySpent: new BigNumber(quantitySpent ?? '0'),
    uses: new BigNumber(0),
    usesSpent: new BigNumber(0),
    expires: 0,
    created: Date.now(),
    ...rest,
  } as unknown as TokenAllowance;
}

export function createMockAllowanceDisplay(
  overrides: Partial<AllowanceDisplay> = {},
): AllowanceDisplay {
  return {
    ...mockMintAllowanceDisplay,
    ...overrides,
  };
}

// Grouped allowances by type for UI testing
export const mockAllowancesByType = {
  mint: mockAllowanceDisplays.filter((a) => a.allowanceType === AllowanceType.Mint),
  burn: mockAllowanceDisplays.filter((a) => a.allowanceType === AllowanceType.Burn),
  lock: mockAllowanceDisplays.filter((a) => a.allowanceType === AllowanceType.Lock),
  transfer: [] as AllowanceDisplay[],
};
