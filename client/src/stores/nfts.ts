import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useSdkStore } from './sdk';
import { useWalletStore } from './wallet';
import { parseError } from '@/lib/errors';

export interface NftBalance {
  owner: string;
  collection: string;
  category: string;
  type: string;
  additionalKey: string;
  instanceIds: string[];
  totalOwned: number;
}

export const useNftStore = defineStore('nfts', () => {
  const balances = ref<NftBalance[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const selectedCollection = ref<string>('');

  const collections = computed(() => {
    const names = new Set<string>();
    for (const nft of balances.value) {
      names.add(nft.collection);
    }
    return Array.from(names).sort();
  });

  const filteredBalances = computed(() => {
    if (!selectedCollection.value) {
      return balances.value;
    }
    return balances.value.filter(
      (nft) => nft.collection === selectedCollection.value,
    );
  });

  async function fetchBalances() {
    const sdkStore = useSdkStore();
    const walletStore = useWalletStore();
    const sdk = sdkStore.sdk;

    if (!sdk || !walletStore.galaAddress) {
      balances.value = [];
      return;
    }

    isLoading.value = true;
    error.value = null;

    try {
      const result = await sdk.fetchNftBalances(walletStore.galaAddress);
      balances.value = result ?? [];
    } catch (err) {
      error.value = parseError(err);
    } finally {
      isLoading.value = false;
    }
  }

  function setCollectionFilter(collection: string) {
    selectedCollection.value = collection;
  }

  function reset() {
    balances.value = [];
    error.value = null;
    selectedCollection.value = '';
  }

  return {
    balances,
    isLoading,
    error,
    selectedCollection,
    collections,
    filteredBalances,
    fetchBalances,
    setCollectionFilter,
    reset,
  };
});
