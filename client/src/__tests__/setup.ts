import { vi } from 'vitest';

// Mock localStorage
const store: Record<string, string> = {};

const localStorageMock: Storage = {
  getItem: vi.fn((key: string) => store[key] ?? null),
  setItem: vi.fn((key: string, value: string) => {
    store[key] = value;
  }),
  removeItem: vi.fn((key: string) => {
    delete store[key];
  }),
  clear: vi.fn(() => {
    Object.keys(store).forEach((key) => delete store[key]);
  }),
  get length() {
    return Object.keys(store).length;
  },
  key: vi.fn((index: number) => Object.keys(store)[index] ?? null),
};

Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

// Mock @gala-chain/launchpad-sdk
vi.mock('@gala-chain/launchpad-sdk', () => {
  const MockLaunchpadSDK = vi.fn().mockImplementation(() => ({
    cleanup: vi.fn(),
    fetchGalaBalance: vi.fn(),
    fetchTokensHeld: vi.fn(),
    fetchNftBalances: vi.fn(),
    fetchNftCollections: vi.fn(),
    fetchNftTokenClasses: vi.fn(),
    transferGala: vi.fn(),
    transferToken: vi.fn(),
    burnTokens: vi.fn(),
    lockTokens: vi.fn(),
    unlockTokens: vi.fn(),
    mintNft: vi.fn(),
    estimateNftMintFee: vi.fn(),
    isNftCollectionAvailable: vi.fn(),
    claimNftCollection: vi.fn(),
    createNftTokenClass: vi.fn(),
  }));

  return {
    LaunchpadSDK: MockLaunchpadSDK,
    ExternalWalletProvider: vi.fn().mockImplementation(() => ({
      connect: vi.fn().mockResolvedValue('0x1234567890abcdef1234567890abcdef12345678'),
      disconnect: vi.fn(),
      getGalaAddress: vi.fn().mockResolvedValue('eth|1234567890abcdef1234567890abcdef12345678'),
    })),
    detectWallets: vi.fn().mockResolvedValue({ wallets: [] }),
  };
});
