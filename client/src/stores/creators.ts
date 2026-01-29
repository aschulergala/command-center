import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useSdkStore } from './sdk';
import { useWalletStore } from './wallet';
import { parseError } from '@/lib/errors';

export interface NftCollectionAuthorization {
  authorizedUser: string;
  collection: string;
  created?: number;
}

export interface NftTokenClassWithSupply {
  collection: string;
  type: string;
  category: string;
  additionalKey: string;
  totalSupply: string;
  maxSupply?: string;
  isNonFungible: boolean;
  name?: string;
  description?: string;
  image?: string;
  symbol?: string;
  rarity?: string;
}

export const useCreatorStore = defineStore('creators', () => {
  const collections = ref<NftCollectionAuthorization[]>([]);
  const selectedCollection = ref<NftCollectionAuthorization | null>(null);
  const tokenClasses = ref<NftTokenClassWithSupply[]>([]);
  const isLoadingCollections = ref(false);
  const isLoadingClasses = ref(false);
  const error = ref<string | null>(null);

  async function fetchCollections() {
    const sdkStore = useSdkStore();
    const walletStore = useWalletStore();
    const sdk = sdkStore.sdk;

    if (!sdk || !walletStore.galaAddress) {
      collections.value = [];
      return;
    }

    isLoadingCollections.value = true;
    error.value = null;

    try {
      const result = await sdk.fetchNftCollections(walletStore.galaAddress);
      collections.value = result ?? [];
    } catch (err) {
      error.value = parseError(err);
    } finally {
      isLoadingCollections.value = false;
    }
  }

  async function fetchTokenClasses(collection: string) {
    const sdkStore = useSdkStore();
    const sdk = sdkStore.requireSdk();

    isLoadingClasses.value = true;
    error.value = null;

    try {
      const result = await sdk.fetchNftTokenClasses({ collection });
      tokenClasses.value = result ?? [];
    } catch (err) {
      error.value = parseError(err);
    } finally {
      isLoadingClasses.value = false;
    }
  }

  function selectCollection(auth: NftCollectionAuthorization) {
    selectedCollection.value = auth;
    fetchTokenClasses(auth.collection);
  }

  function reset() {
    collections.value = [];
    selectedCollection.value = null;
    tokenClasses.value = [];
    error.value = null;
  }

  return {
    collections,
    selectedCollection,
    tokenClasses,
    isLoadingCollections,
    isLoadingClasses,
    error,
    fetchCollections,
    fetchTokenClasses,
    selectCollection,
    reset,
  };
});
