import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useSdkStore } from './sdk';
import { useWalletStore } from './wallet';
import { parseError } from '@/lib/errors';
import { GALA_TOKEN_ID } from '@/lib/constants';

export interface TokenBalance {
  tokenId: string;
  collection: string;
  category: string;
  quantity: string;
  lockedQuantity: string;
  availableQuantity: string;
  displayName: string;
}

export type SortOption = 'name' | 'balance-high' | 'balance-low';

export const useTokenStore = defineStore('tokens', () => {
  const balances = ref<TokenBalance[]>([]);
  const galaBalance = ref<string>('0');
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const sortBy = ref<SortOption>('balance-high');

  const sortedBalances = computed(() => {
    const list = [...balances.value];
    switch (sortBy.value) {
      case 'name':
        return list.sort((a, b) => a.displayName.localeCompare(b.displayName));
      case 'balance-high': {
        return list.sort((a, b) => {
          const diff = parseFloat(b.quantity) - parseFloat(a.quantity);
          return diff > 0 ? 1 : diff < 0 ? -1 : 0;
        });
      }
      case 'balance-low': {
        return list.sort((a, b) => {
          const diff = parseFloat(a.quantity) - parseFloat(b.quantity);
          return diff > 0 ? 1 : diff < 0 ? -1 : 0;
        });
      }
      default:
        return list;
    }
  });

  async function fetchBalances() {
    const sdkStore = useSdkStore();
    const walletStore = useWalletStore();
    const sdk = sdkStore.sdk;

    if (!sdk || !walletStore.galaAddress) {
      balances.value = [];
      galaBalance.value = '0';
      return;
    }

    // Validate that galaAddress has the expected eth| prefix before using it
    if (!walletStore.galaAddress.startsWith('eth|')) {
      balances.value = [];
      galaBalance.value = '0';
      return;
    }

    isLoading.value = true;
    error.value = null;

    try {
      // Fetch GALA balance
      const galaResult = await sdk.fetchGalaBalance(walletStore.galaAddress);
      galaBalance.value = galaResult?.quantity ?? '0';

      // Build the GALA entry
      const galaEntry: TokenBalance = {
        tokenId: GALA_TOKEN_ID,
        collection: 'GALA',
        category: 'Unit',
        quantity: galaResult?.quantity ?? '0',
        lockedQuantity: galaResult?.lockedQuantity ?? '0',
        availableQuantity: galaResult?.availableQuantity ?? galaResult?.quantity ?? '0',
        displayName: 'GALA',
      };

      // Fetch user's token list from launchpad API
      // galaAddress is validated to start with 'eth|' above
      const tokensResult = await sdk.fetchTokensHeld({
        address: walletStore.galaAddress as `eth|${string}`,
        pageSize: 100,
      });

      const tokenEntries: TokenBalance[] = (tokensResult?.tokens ?? []).map((t) => ({
        tokenId: t.name,
        collection: 'Token',
        category: 'Unit',
        quantity: t.balance ?? '0',
        lockedQuantity: '0',
        availableQuantity: t.balance ?? '0',
        displayName: t.symbol || t.name,
      }));

      balances.value = [galaEntry, ...tokenEntries];
    } catch (err) {
      error.value = parseError(err);
    } finally {
      isLoading.value = false;
    }
  }

  function setSortBy(option: SortOption) {
    sortBy.value = option;
  }

  function reset() {
    balances.value = [];
    galaBalance.value = '0';
    error.value = null;
  }

  return {
    balances,
    galaBalance,
    isLoading,
    error,
    sortBy,
    sortedBalances,
    fetchBalances,
    setSortBy,
    reset,
  };
});
