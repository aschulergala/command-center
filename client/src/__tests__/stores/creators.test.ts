import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useCreatorStore } from '@/stores/creators';
import { useSdkStore } from '@/stores/sdk';
import { useWalletStore } from '@/stores/wallet';
import type { NftCollectionAuthorization, NftTokenClassWithSupply } from '@/stores/creators';

function createMockAuth(overrides: Partial<NftCollectionAuthorization> = {}): NftCollectionAuthorization {
  return {
    authorizedUser: 'eth|abc123',
    collection: 'TestCollection',
    created: Date.now(),
    ...overrides,
  };
}

function createMockTokenClass(overrides: Partial<NftTokenClassWithSupply> = {}): NftTokenClassWithSupply {
  return {
    collection: 'TestCollection',
    type: 'Item',
    category: 'Unit',
    additionalKey: 'none',
    totalSupply: '100',
    maxSupply: '1000',
    isNonFungible: true,
    name: 'TestNFT',
    description: 'A test NFT',
    image: 'https://example.com/image.png',
    symbol: 'TNFT',
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

describe('useCreatorStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  describe('fetchCollections()', () => {
    it('populates collections from SDK response', async () => {
      const { sdk } = setupStoresWithSdk();
      const mockCollections = [
        createMockAuth({ collection: 'Dragons' }),
        createMockAuth({ collection: 'Swords' }),
      ];
      (sdk.fetchNftCollections as any).mockResolvedValue(mockCollections);

      const store = useCreatorStore();
      await store.fetchCollections();

      expect(store.collections).toHaveLength(2);
      expect(store.collections[0].collection).toBe('Dragons');
      expect(store.collections[1].collection).toBe('Swords');
    });

    it('resets to empty when SDK is not available', async () => {
      const walletStore = useWalletStore();
      walletStore.galaAddress = 'eth|abc123';

      const sdkStore = useSdkStore();
      (sdkStore as any).sdk = null;

      const store = useCreatorStore();
      store.collections = [createMockAuth()];

      await store.fetchCollections();

      expect(store.collections).toHaveLength(0);
    });

    it('resets to empty when galaAddress is not set', async () => {
      useSdkStore();
      const walletStore = useWalletStore();
      walletStore.galaAddress = null;

      const store = useCreatorStore();
      await store.fetchCollections();

      expect(store.collections).toHaveLength(0);
    });

    it('sets isLoadingCollections during fetch', async () => {
      const { sdk } = setupStoresWithSdk();

      let resolveCollections: (v: any) => void;
      (sdk.fetchNftCollections as any).mockReturnValue(
        new Promise((resolve) => { resolveCollections = resolve; }),
      );

      const store = useCreatorStore();
      const fetchPromise = store.fetchCollections();

      expect(store.isLoadingCollections).toBe(true);

      resolveCollections!([]);
      await fetchPromise;

      expect(store.isLoadingCollections).toBe(false);
    });

    it('handles errors by setting error string', async () => {
      const { sdk } = setupStoresWithSdk();
      (sdk.fetchNftCollections as any).mockRejectedValue(new Error('Network error'));

      const store = useCreatorStore();
      await store.fetchCollections();

      expect(store.error).toBeTruthy();
      expect(store.isLoadingCollections).toBe(false);
    });

    it('handles null SDK response gracefully', async () => {
      const { sdk } = setupStoresWithSdk();
      (sdk.fetchNftCollections as any).mockResolvedValue(null);

      const store = useCreatorStore();
      await store.fetchCollections();

      expect(store.collections).toHaveLength(0);
    });
  });

  describe('fetchTokenClasses()', () => {
    it('populates tokenClasses from SDK response', async () => {
      const { sdk } = setupStoresWithSdk();
      const mockClasses = [
        createMockTokenClass({ name: 'Sword', totalSupply: '50' }),
        createMockTokenClass({ name: 'Shield', totalSupply: '30' }),
      ];
      (sdk.fetchNftTokenClasses as any).mockResolvedValue(mockClasses);

      const store = useCreatorStore();
      await store.fetchTokenClasses('TestCollection');

      expect(store.tokenClasses).toHaveLength(2);
      expect(store.tokenClasses[0].name).toBe('Sword');
      expect(store.tokenClasses[1].name).toBe('Shield');
    });

    it('calls SDK with the correct collection parameter', async () => {
      const { sdk } = setupStoresWithSdk();
      (sdk.fetchNftTokenClasses as any).mockResolvedValue([]);

      const store = useCreatorStore();
      await store.fetchTokenClasses('MyCollection');

      expect(sdk.fetchNftTokenClasses).toHaveBeenCalledWith({ collection: 'MyCollection' });
    });

    it('sets isLoadingClasses during fetch', async () => {
      const { sdk } = setupStoresWithSdk();

      let resolveClasses: (v: any) => void;
      (sdk.fetchNftTokenClasses as any).mockReturnValue(
        new Promise((resolve) => { resolveClasses = resolve; }),
      );

      const store = useCreatorStore();
      const fetchPromise = store.fetchTokenClasses('Col');

      expect(store.isLoadingClasses).toBe(true);

      resolveClasses!([]);
      await fetchPromise;

      expect(store.isLoadingClasses).toBe(false);
    });

    it('handles errors by setting error string', async () => {
      const { sdk } = setupStoresWithSdk();
      (sdk.fetchNftTokenClasses as any).mockRejectedValue(new Error('Fetch failed'));

      const store = useCreatorStore();
      await store.fetchTokenClasses('Col');

      expect(store.error).toBeTruthy();
      expect(store.isLoadingClasses).toBe(false);
    });

    it('throws when SDK is not initialized (requireSdk)', async () => {
      const sdkStore = useSdkStore();
      (sdkStore as any).sdk = null;

      const store = useCreatorStore();

      await expect(store.fetchTokenClasses('Col')).rejects.toThrow('SDK not initialized');
    });

    it('handles null SDK response gracefully', async () => {
      const { sdk } = setupStoresWithSdk();
      (sdk.fetchNftTokenClasses as any).mockResolvedValue(null);

      const store = useCreatorStore();
      await store.fetchTokenClasses('Col');

      expect(store.tokenClasses).toHaveLength(0);
    });
  });

  describe('selectCollection()', () => {
    it('sets selectedCollection', async () => {
      const { sdk } = setupStoresWithSdk();
      (sdk.fetchNftTokenClasses as any).mockResolvedValue([]);

      const store = useCreatorStore();
      const auth = createMockAuth({ collection: 'SelectedCol' });

      store.selectCollection(auth);

      expect(store.selectedCollection).toEqual(auth);
    });

    it('triggers fetchTokenClasses with the collection name', async () => {
      const { sdk } = setupStoresWithSdk();
      (sdk.fetchNftTokenClasses as any).mockResolvedValue([
        createMockTokenClass({ name: 'Item1' }),
      ]);

      const store = useCreatorStore();
      const auth = createMockAuth({ collection: 'Dragons' });

      store.selectCollection(auth);

      // Wait for the async fetchTokenClasses to complete
      await vi.waitFor(() => {
        expect(sdk.fetchNftTokenClasses).toHaveBeenCalledWith({ collection: 'Dragons' });
      });
    });

    it('populates tokenClasses after selection', async () => {
      const { sdk } = setupStoresWithSdk();
      const mockClasses = [createMockTokenClass({ name: 'DragonEgg' })];
      (sdk.fetchNftTokenClasses as any).mockResolvedValue(mockClasses);

      const store = useCreatorStore();
      const auth = createMockAuth({ collection: 'Dragons' });

      store.selectCollection(auth);

      await vi.waitFor(() => {
        expect(store.tokenClasses).toHaveLength(1);
        expect(store.tokenClasses[0].name).toBe('DragonEgg');
      });
    });
  });

  describe('reset()', () => {
    it('clears all state', async () => {
      const { sdk } = setupStoresWithSdk();
      (sdk.fetchNftCollections as any).mockResolvedValue([
        createMockAuth({ collection: 'Test' }),
      ]);
      (sdk.fetchNftTokenClasses as any).mockResolvedValue([
        createMockTokenClass({ name: 'Item' }),
      ]);

      const store = useCreatorStore();

      await store.fetchCollections();
      await store.fetchTokenClasses('Test');
      store.selectedCollection = createMockAuth({ collection: 'Test' });

      expect(store.collections).toHaveLength(1);
      expect(store.tokenClasses).toHaveLength(1);
      expect(store.selectedCollection).not.toBeNull();

      store.reset();

      expect(store.collections).toHaveLength(0);
      expect(store.tokenClasses).toHaveLength(0);
      expect(store.selectedCollection).toBeNull();
      expect(store.error).toBeNull();
    });
  });

  describe('error state', () => {
    it('clears error when a new fetch starts (fetchCollections)', async () => {
      const { sdk } = setupStoresWithSdk();
      (sdk.fetchNftCollections as any)
        .mockRejectedValueOnce(new Error('First fail'))
        .mockResolvedValueOnce([]);

      const store = useCreatorStore();

      await store.fetchCollections();
      expect(store.error).toBeTruthy();

      await store.fetchCollections();
      expect(store.error).toBeNull();
    });

    it('clears error when a new fetch starts (fetchTokenClasses)', async () => {
      const { sdk } = setupStoresWithSdk();
      (sdk.fetchNftTokenClasses as any)
        .mockRejectedValueOnce(new Error('First fail'))
        .mockResolvedValueOnce([]);

      const store = useCreatorStore();

      await store.fetchTokenClasses('Col');
      expect(store.error).toBeTruthy();

      await store.fetchTokenClasses('Col');
      expect(store.error).toBeNull();
    });
  });
});
