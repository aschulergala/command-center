/**
 * Composable for fetching and managing NFTs
 *
 * Provides reactive access to NFTs and their collections.
 * Integrates with the NFTs store and GalaChain client.
 */

import { computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { AllowanceType } from '@gala-chain/api'
import type { TokenBalance } from '@gala-chain/connect'
import { useNFTsStore, type NFTSortOption } from '@/stores/nfts'
import { useWalletStore } from '@/stores/wallet'
import { useGalaChain } from '@/composables/useGalaChain'

/**
 * Composable for NFT operations
 */
export function useNFTs() {
  const nftsStore = useNFTsStore()
  const walletStore = useWalletStore()
  const galaChain = useGalaChain()
  const router = useRouter()
  const route = useRoute()

  // Computed properties from store
  const nfts = computed(() => nftsStore.sortedNFTs)
  const collections = computed(() => nftsStore.collections)
  const selectedCollection = computed(() => nftsStore.selectedCollection)
  const isLoading = computed(() => nftsStore.isLoading)
  const error = computed(() => nftsStore.error)
  const sortBy = computed(() => nftsStore.sortBy)
  const hasNFTs = computed(() => nftsStore.hasNFTs)
  const totalNFTCount = computed(() => nftsStore.totalNFTCount)
  const filteredCount = computed(() => nftsStore.filteredCount)

  // Wallet connection state
  const isConnected = computed(() => walletStore.connected)
  const walletAddress = computed(() => walletStore.address)

  /**
   * Fetch NFT balances from GalaChain
   */
  async function fetchNFTs(): Promise<void> {
    if (!walletStore.connected || !walletStore.address) {
      return
    }

    nftsStore.setLoading(true)
    nftsStore.setError(null)

    try {
      const result = await galaChain.getBalances()

      if (result.success) {
        // Cast to TokenBalance from @gala-chain/connect which is the actual return type
        nftsStore.setBalances(result.data as unknown as TokenBalance[])
      } else {
        nftsStore.setError(result.error)
      }
    } catch (err) {
      nftsStore.setError(
        err instanceof Error ? err.message : 'Failed to fetch NFTs'
      )
    } finally {
      nftsStore.setLoading(false)
    }
  }

  /**
   * Fetch allowances from GalaChain (for burn authority)
   */
  async function fetchAllowances(): Promise<void> {
    if (!walletStore.connected || !walletStore.address) {
      return
    }

    try {
      const result = await galaChain.getAllowances()

      if (result.success) {
        nftsStore.setAllowances(
          result.data,
          AllowanceType.Burn
        )
      }
    } catch {
      // Silently fail for allowances - they're supplementary data
      console.warn('Failed to fetch allowances for NFTs')
    }
  }

  /**
   * Fetch both NFTs and allowances
   */
  async function fetchAll(): Promise<void> {
    await Promise.all([fetchNFTs(), fetchAllowances()])
  }

  /**
   * Refresh NFT data if needed
   */
  async function refresh(force: boolean = false): Promise<void> {
    if (force || nftsStore.needsRefresh()) {
      await fetchAll()
    }
  }

  /**
   * Update sort order
   */
  function setSort(option: NFTSortOption): void {
    nftsStore.setSort(option)
  }

  /**
   * Set collection filter and sync with URL
   */
  function setCollectionFilter(collectionKey: string | null): void {
    nftsStore.setCollectionFilter(collectionKey)

    // Update URL query param
    if (collectionKey) {
      router.push({ query: { ...route.query, collection: collectionKey } })
    } else {
      const { collection: _, ...rest } = route.query
      router.push({ query: rest })
    }
  }

  /**
   * Clear collection filter
   */
  function clearFilter(): void {
    setCollectionFilter(null)
  }

  /**
   * Get an NFT by its key
   */
  function getNFT(instanceKey: string) {
    return nftsStore.getNFTByKey(instanceKey)
  }

  /**
   * Clear all NFT data (called on disconnect)
   */
  function clearNFTs(): void {
    nftsStore.clearNFTs()
  }

  // Watch for wallet connection changes
  watch(
    () => walletStore.connected,
    (connected) => {
      if (connected) {
        // Fetch NFTs when wallet connects
        fetchAll()
      } else {
        // Clear NFTs when wallet disconnects
        clearNFTs()
      }
    },
    { immediate: false }
  )

  // Watch for wallet address changes (account switch)
  watch(
    () => walletStore.address,
    (newAddress, oldAddress) => {
      if (newAddress && newAddress !== oldAddress) {
        // Refetch NFTs when address changes
        fetchAll()
      }
    }
  )

  // Sync URL collection param to store on mount
  watch(
    () => route.query.collection,
    (collectionParam) => {
      const collectionKey = collectionParam as string | undefined
      if (collectionKey !== nftsStore.selectedCollection) {
        nftsStore.setCollectionFilter(collectionKey || null)
      }
    },
    { immediate: true }
  )

  return {
    // State from store
    nfts,
    collections,
    selectedCollection,
    isLoading,
    error,
    sortBy,
    hasNFTs,
    totalNFTCount,
    filteredCount,

    // Wallet state
    isConnected,
    walletAddress,

    // Actions
    fetchNFTs,
    fetchAllowances,
    fetchAll,
    refresh,
    setSort,
    setCollectionFilter,
    clearFilter,
    getNFT,
    clearNFTs,
  }
}

// Export type for use in components
export type UseNFTs = ReturnType<typeof useNFTs>
