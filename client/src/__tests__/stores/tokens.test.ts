import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useTokenStore } from '@/stores/tokens';
import { useSdkStore } from '@/stores/sdk';
import { useWalletStore } from '@/stores/wallet';
import type { TokenBalance, SortOption } from '@/stores/tokens';

function setupStoresWithSdk() {
  const walletStore = useWalletStore();
  walletStore.galaAddress = 'eth|abc123def456';

  const sdkStore = useSdkStore();
  // sdkStore auto-initializes on creation, so sdk should already be set
  const sdk = sdkStore.sdk!;

  return { walletStore, sdkStore, sdk };
}

function mockGalaBalance(sdk: any, overrides: Partial<{ quantity: string; lockedQuantity: string; availableQuantity: string }> = {}) {
  (sdk.fetchGalaBalance as any).mockResolvedValue({
    quantity: '100',
    lockedQuantity: '10',
    availableQuantity: '90',
    ...overrides,
  });
}

function mockTokensHeld(sdk: any, tokens: Array<{ name: string; balance: string; symbol: string }> = []) {
  (sdk.fetchTokensHeld as any).mockResolvedValue({ tokens });
}

describe('useTokenStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  describe('fetchBalances()', () => {
    it('populates balances array with GALA entry first, then other tokens', async () => {
      const { sdk } = setupStoresWithSdk();
      mockGalaBalance(sdk);
      mockTokensHeld(sdk, [
        { name: 'TokenA', balance: '50', symbol: 'TKA' },
        { name: 'TokenB', balance: '200', symbol: 'TKB' },
      ]);

      const store = useTokenStore();
      await store.fetchBalances();

      expect(store.balances).toHaveLength(3);
      expect(store.balances[0].displayName).toBe('GALA');
      expect(store.balances[0].quantity).toBe('100');
      expect(store.balances[0].lockedQuantity).toBe('10');
      expect(store.balances[0].availableQuantity).toBe('90');

      expect(store.balances[1].displayName).toBe('TKA');
      expect(store.balances[1].quantity).toBe('50');

      expect(store.balances[2].displayName).toBe('TKB');
      expect(store.balances[2].quantity).toBe('200');
    });

    it('sets galaBalance from the SDK response', async () => {
      const { sdk } = setupStoresWithSdk();
      mockGalaBalance(sdk, { quantity: '999' });
      mockTokensHeld(sdk);

      const store = useTokenStore();
      await store.fetchBalances();

      expect(store.galaBalance).toBe('999');
    });

    it('resets to empty when SDK is not available', async () => {
      const walletStore = useWalletStore();
      walletStore.galaAddress = 'eth|abc123';

      const sdkStore = useSdkStore();
      // Force sdk to null to simulate uninitialized state
      (sdkStore as any).sdk = null;

      const store = useTokenStore();
      // Pre-populate to verify reset
      store.balances = [{ tokenId: 'X', collection: 'X', category: 'X', quantity: '1', lockedQuantity: '0', availableQuantity: '1', displayName: 'X' }];

      await store.fetchBalances();

      expect(store.balances).toHaveLength(0);
      expect(store.galaBalance).toBe('0');
    });

    it('resets to empty when galaAddress is not set', async () => {
      const sdkStore = useSdkStore();
      // sdk is initialized, but no wallet address
      const walletStore = useWalletStore();
      walletStore.galaAddress = null;

      const store = useTokenStore();
      await store.fetchBalances();

      expect(store.balances).toHaveLength(0);
      expect(store.galaBalance).toBe('0');
    });

    it('handles errors by setting error string', async () => {
      const { sdk } = setupStoresWithSdk();
      (sdk.fetchGalaBalance as any).mockRejectedValue(new Error('Network error'));

      const store = useTokenStore();
      await store.fetchBalances();

      expect(store.error).toBeTruthy();
      expect(store.balances).toHaveLength(0);
    });

    it('sets isLoading to true during fetch and false after', async () => {
      const { sdk } = setupStoresWithSdk();

      let resolveBalance: (v: any) => void;
      (sdk.fetchGalaBalance as any).mockReturnValue(
        new Promise((resolve) => { resolveBalance = resolve; }),
      );
      mockTokensHeld(sdk);

      const store = useTokenStore();
      const fetchPromise = store.fetchBalances();

      expect(store.isLoading).toBe(true);

      resolveBalance!({ quantity: '50', lockedQuantity: '0', availableQuantity: '50' });
      await fetchPromise;

      expect(store.isLoading).toBe(false);
    });

    it('sets isLoading to false after an error', async () => {
      const { sdk } = setupStoresWithSdk();
      (sdk.fetchGalaBalance as any).mockRejectedValue(new Error('fail'));

      const store = useTokenStore();
      await store.fetchBalances();

      expect(store.isLoading).toBe(false);
    });

    it('uses token name as displayName when symbol is empty', async () => {
      const { sdk } = setupStoresWithSdk();
      mockGalaBalance(sdk);
      mockTokensHeld(sdk, [
        { name: 'LongTokenName', balance: '10', symbol: '' },
      ]);

      const store = useTokenStore();
      await store.fetchBalances();

      expect(store.balances[1].displayName).toBe('LongTokenName');
    });

    it('handles null galaBalance result gracefully', async () => {
      const { sdk } = setupStoresWithSdk();
      (sdk.fetchGalaBalance as any).mockResolvedValue(null);
      mockTokensHeld(sdk);

      const store = useTokenStore();
      await store.fetchBalances();

      expect(store.galaBalance).toBe('0');
      expect(store.balances[0].quantity).toBe('0');
    });
  });

  describe('sortedBalances', () => {
    function createBalances(): TokenBalance[] {
      return [
        { tokenId: 'A', collection: 'C', category: 'U', quantity: '100', lockedQuantity: '0', availableQuantity: '100', displayName: 'GALA' },
        { tokenId: 'B', collection: 'C', category: 'U', quantity: '50', lockedQuantity: '0', availableQuantity: '50', displayName: 'Zebra' },
        { tokenId: 'C', collection: 'C', category: 'U', quantity: '200', lockedQuantity: '0', availableQuantity: '200', displayName: 'Alpha' },
      ];
    }

    it('sorts by name alphabetically', () => {
      const store = useTokenStore();
      store.balances = createBalances();
      store.setSortBy('name');

      const names = store.sortedBalances.map((b) => b.displayName);
      expect(names).toEqual(['Alpha', 'GALA', 'Zebra']);
    });

    it('sorts by balance-high (descending)', () => {
      const store = useTokenStore();
      store.balances = createBalances();
      store.setSortBy('balance-high');

      const quantities = store.sortedBalances.map((b) => b.quantity);
      expect(quantities).toEqual(['200', '100', '50']);
    });

    it('sorts by balance-low (ascending)', () => {
      const store = useTokenStore();
      store.balances = createBalances();
      store.setSortBy('balance-low');

      const quantities = store.sortedBalances.map((b) => b.quantity);
      expect(quantities).toEqual(['50', '100', '200']);
    });

    it('does not mutate the original balances array', () => {
      const store = useTokenStore();
      store.balances = createBalances();
      store.setSortBy('name');

      const sorted = store.sortedBalances;
      expect(sorted).not.toBe(store.balances);
      expect(store.balances[0].displayName).toBe('GALA');
    });
  });

  describe('setSortBy()', () => {
    it('changes the sort option', () => {
      const store = useTokenStore();

      expect(store.sortBy).toBe('balance-high'); // default

      store.setSortBy('name');
      expect(store.sortBy).toBe('name');

      store.setSortBy('balance-low');
      expect(store.sortBy).toBe('balance-low');
    });
  });

  describe('reset()', () => {
    it('clears all state', async () => {
      const { sdk } = setupStoresWithSdk();
      mockGalaBalance(sdk, { quantity: '500' });
      mockTokensHeld(sdk, [{ name: 'TKN', balance: '10', symbol: 'TKN' }]);

      const store = useTokenStore();
      await store.fetchBalances();

      expect(store.balances.length).toBeGreaterThan(0);
      expect(store.galaBalance).not.toBe('0');

      store.reset();

      expect(store.balances).toHaveLength(0);
      expect(store.galaBalance).toBe('0');
      expect(store.error).toBeNull();
    });
  });
});
