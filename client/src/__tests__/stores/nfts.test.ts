import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useNftStore } from '@/stores/nfts';
import { useSdkStore } from '@/stores/sdk';
import { useWalletStore } from '@/stores/wallet';
import type { NftBalance } from '@/stores/nfts';

function createMockNft(overrides: Partial<NftBalance> = {}): NftBalance {
  return {
    owner: 'eth|abc123',
    collection: 'TestCollection',
    category: 'Item',
    type: 'NFT',
    additionalKey: 'none',
    instanceIds: ['1'],
    totalOwned: 1,
    ...overrides,
  };
}

function setupStoresWithSdk() {
  const walletStore = useWalletStore();
  walletStore.galaAddress = 'eth|abc123def456';

  const sdkStore = useSdkStore();
  const sdk = sdkStore.sdk!;

  return { walletStore, sdkStore, sdk };
}

describe('useNftStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  describe('fetchBalances()', () => {
    it('populates balances array from SDK response', async () => {
      const { sdk } = setupStoresWithSdk();
      const mockNfts = [
        createMockNft({ collection: 'Dragons', totalOwned: 3, instanceIds: ['1', '2', '3'] }),
        createMockNft({ collection: 'Swords', totalOwned: 1 }),
      ];
      (sdk.fetchNftBalances as any).mockResolvedValue(mockNfts);

      const store = useNftStore();
      await store.fetchBalances();

      expect(store.balances).toHaveLength(2);
      expect(store.balances[0].collection).toBe('Dragons');
      expect(store.balances[0].totalOwned).toBe(3);
      expect(store.balances[1].collection).toBe('Swords');
    });

    it('resets to empty when SDK is not available', async () => {
      const walletStore = useWalletStore();
      walletStore.galaAddress = 'eth|abc123';

      const sdkStore = useSdkStore();
      (sdkStore as any).sdk = null;

      const store = useNftStore();
      store.balances = [createMockNft()];

      await store.fetchBalances();

      expect(store.balances).toHaveLength(0);
    });

    it('resets to empty when galaAddress is not set', async () => {
      useSdkStore(); // initialized but no wallet address
      const walletStore = useWalletStore();
      walletStore.galaAddress = null;

      const store = useNftStore();
      await store.fetchBalances();

      expect(store.balances).toHaveLength(0);
    });

    it('sets isLoading during fetch', async () => {
      const { sdk } = setupStoresWithSdk();

      let resolveNfts: (v: any) => void;
      (sdk.fetchNftBalances as any).mockReturnValue(
        new Promise((resolve) => { resolveNfts = resolve; }),
      );

      const store = useNftStore();
      const fetchPromise = store.fetchBalances();

      expect(store.isLoading).toBe(true);

      resolveNfts!([]);
      await fetchPromise;

      expect(store.isLoading).toBe(false);
    });

    it('handles errors by setting error string', async () => {
      const { sdk } = setupStoresWithSdk();
      (sdk.fetchNftBalances as any).mockRejectedValue(new Error('Request timed out'));

      const store = useNftStore();
      await store.fetchBalances();

      expect(store.error).toBeTruthy();
      expect(store.isLoading).toBe(false);
    });

    it('handles null SDK response gracefully', async () => {
      const { sdk } = setupStoresWithSdk();
      (sdk.fetchNftBalances as any).mockResolvedValue(null);

      const store = useNftStore();
      await store.fetchBalances();

      expect(store.balances).toHaveLength(0);
    });
  });

  describe('collections computed', () => {
    it('extracts unique sorted collection names', () => {
      const store = useNftStore();
      store.balances = [
        createMockNft({ collection: 'Zebra' }),
        createMockNft({ collection: 'Alpha' }),
        createMockNft({ collection: 'Zebra' }),
        createMockNft({ collection: 'Middle' }),
      ];

      expect(store.collections).toEqual(['Alpha', 'Middle', 'Zebra']);
    });

    it('returns empty array when no balances', () => {
      const store = useNftStore();
      expect(store.collections).toEqual([]);
    });

    it('handles single collection', () => {
      const store = useNftStore();
      store.balances = [
        createMockNft({ collection: 'OnlyOne' }),
        createMockNft({ collection: 'OnlyOne' }),
      ];

      expect(store.collections).toEqual(['OnlyOne']);
    });
  });

  describe('filteredBalances computed', () => {
    it('returns all balances when no filter is set', () => {
      const store = useNftStore();
      store.balances = [
        createMockNft({ collection: 'A' }),
        createMockNft({ collection: 'B' }),
        createMockNft({ collection: 'C' }),
      ];

      expect(store.filteredBalances).toHaveLength(3);
    });

    it('filters by selected collection', () => {
      const store = useNftStore();
      store.balances = [
        createMockNft({ collection: 'Dragons', totalOwned: 2 }),
        createMockNft({ collection: 'Swords', totalOwned: 5 }),
        createMockNft({ collection: 'Dragons', totalOwned: 1 }),
      ];

      store.setCollectionFilter('Dragons');

      expect(store.filteredBalances).toHaveLength(2);
      expect(store.filteredBalances.every((b) => b.collection === 'Dragons')).toBe(true);
    });

    it('returns empty when filter matches nothing', () => {
      const store = useNftStore();
      store.balances = [
        createMockNft({ collection: 'Dragons' }),
      ];

      store.setCollectionFilter('NonExistent');

      expect(store.filteredBalances).toHaveLength(0);
    });
  });

  describe('setCollectionFilter()', () => {
    it('changes the selectedCollection', () => {
      const store = useNftStore();

      expect(store.selectedCollection).toBe('');

      store.setCollectionFilter('MyCollection');

      expect(store.selectedCollection).toBe('MyCollection');
    });

    it('can clear the filter by setting empty string', () => {
      const store = useNftStore();
      store.setCollectionFilter('Something');
      store.setCollectionFilter('');

      expect(store.selectedCollection).toBe('');
    });
  });

  describe('reset()', () => {
    it('clears all state', async () => {
      const { sdk } = setupStoresWithSdk();
      (sdk.fetchNftBalances as any).mockResolvedValue([
        createMockNft({ collection: 'Test' }),
      ]);

      const store = useNftStore();
      await store.fetchBalances();
      store.setCollectionFilter('Test');

      expect(store.balances).toHaveLength(1);
      expect(store.selectedCollection).toBe('Test');

      store.reset();

      expect(store.balances).toHaveLength(0);
      expect(store.error).toBeNull();
      expect(store.selectedCollection).toBe('');
    });
  });
});
