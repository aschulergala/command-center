/**
 * Composable for fetching and managing creator collections
 *
 * Provides reactive access to collections where the connected wallet has authority.
 * Integrates with the creatorCollections store and GalaChain client.
 */

import { computed, watch } from 'vue'
import { AllowanceType } from '@gala-chain/api'
import type { TokenBalance } from '@gala-chain/connect'
import { useCreatorCollectionsStore, type CollectionSortOption } from '@/stores/creatorCollections'
import { useWalletStore } from '@/stores/wallet'
import { useGalaChain } from '@/composables/useGalaChain'

/**
 * Composable for creator collection operations
 */
export function useCreatorCollections() {
  const collectionsStore = useCreatorCollectionsStore()
  const walletStore = useWalletStore()
  const galaChain = useGalaChain()

  // Computed properties from store
  const collections = computed(() => collectionsStore.sortedCollections)
  const isLoading = computed(() => collectionsStore.isLoading)
  const error = computed(() => collectionsStore.error)
  const sortBy = computed(() => collectionsStore.sortBy)
  const hasCollections = computed(() => collectionsStore.hasCollections)
  const totalCollectionCount = computed(() => collectionsStore.totalCollectionCount)

  // Wallet connection state
  const isConnected = computed(() => walletStore.connected)
  const walletAddress = computed(() => walletStore.address)

  /**
   * Fetch collections where the connected wallet has authority
   * Authority is determined by having a Mint allowance for instance 0 (collection-level)
   */
  async function fetchCollections(): Promise<void> {
    if (!walletStore.connected || !walletStore.address) {
      return
    }

    collectionsStore.setLoading(true)
    collectionsStore.setError(null)

    try {
      // Fetch allowances to find collections where user has mint authority
      const allowancesResult = await galaChain.getAllowances()

      if (allowancesResult.success) {
        collectionsStore.setAllowances(allowancesResult.data, AllowanceType.Mint)
      } else {
        collectionsStore.setError(allowancesResult.error)
        return
      }

      // Also fetch balances to enrich collection data with owned counts
      const balancesResult = await galaChain.getBalances()

      if (balancesResult.success) {
        collectionsStore.setBalances(balancesResult.data as unknown as TokenBalance[])
      }
      // Note: We don't fail if balances fail - they're supplementary
    } catch (err) {
      collectionsStore.setError(
        err instanceof Error ? err.message : 'Failed to fetch collections'
      )
    } finally {
      collectionsStore.setLoading(false)
    }
  }

  /**
   * Refresh collection data
   */
  async function refresh(force: boolean = false): Promise<void> {
    if (force || collectionsStore.needsRefresh()) {
      await fetchCollections()
    }
  }

  /**
   * Update sort order
   */
  function setSort(option: CollectionSortOption): void {
    collectionsStore.setSort(option)
  }

  /**
   * Toggle collection expansion
   */
  function toggleExpanded(collectionKey: string): void {
    collectionsStore.toggleExpanded(collectionKey)
  }

  /**
   * Get a collection by its key
   */
  function getCollection(collectionKey: string) {
    return collectionsStore.getCollectionByKey(collectionKey)
  }

  /**
   * Clear all collection data (called on disconnect)
   */
  function clearCollections(): void {
    collectionsStore.clearCollections()
  }

  // Watch for wallet connection changes
  watch(
    () => walletStore.connected,
    (connected) => {
      if (connected) {
        // Fetch collections when wallet connects
        fetchCollections()
      } else {
        // Clear collections when wallet disconnects
        clearCollections()
      }
    },
    { immediate: false }
  )

  // Watch for wallet address changes (account switch)
  watch(
    () => walletStore.address,
    (newAddress, oldAddress) => {
      if (newAddress && newAddress !== oldAddress) {
        // Refetch collections when address changes
        fetchCollections()
      }
    }
  )

  return {
    // State from store
    collections,
    isLoading,
    error,
    sortBy,
    hasCollections,
    totalCollectionCount,

    // Wallet state
    isConnected,
    walletAddress,

    // Actions
    fetchCollections,
    refresh,
    setSort,
    toggleExpanded,
    getCollection,
    clearCollections,
  }
}

// Export type for use in components
export type UseCreatorCollections = ReturnType<typeof useCreatorCollections>
