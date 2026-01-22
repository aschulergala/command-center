/**
 * Composable for fetching and managing fungible tokens
 *
 * Provides reactive access to fungible tokens and their allowances.
 * Integrates with the tokens store and GalaChain client.
 */

import { computed, watch } from 'vue'
import { AllowanceType } from '@gala-chain/api'
import { useTokensStore, type TokenSortOption } from '@/stores/tokens'
import { useWalletStore } from '@/stores/wallet'
import { useGalaChain } from '@/composables/useGalaChain'

/**
 * Composable for fungible token operations
 */
export function useFungibleTokens() {
  const tokensStore = useTokensStore()
  const walletStore = useWalletStore()
  const galaChain = useGalaChain()

  // Computed properties from store
  const tokens = computed(() => tokensStore.sortedTokens)
  const allowances = computed(() => tokensStore.allowances) // Combined for backward compatibility
  const allowancesReceived = computed(() => tokensStore.allowancesReceived)
  const allowancesGranted = computed(() => tokensStore.allowancesGranted)
  const isLoading = computed(() => tokensStore.isLoading)
  const isLoadingAllowances = computed(() => tokensStore.isLoadingAllowances)
  const error = computed(() => tokensStore.error)
  const sortBy = computed(() => tokensStore.sortBy)
  const hasTokens = computed(() => tokensStore.hasTokens)
  const mintableTokens = computed(() => tokensStore.mintableTokens)
  const burnableTokens = computed(() => tokensStore.burnableTokens)

  // Wallet connection state
  const isConnected = computed(() => walletStore.connected)
  const walletAddress = computed(() => walletStore.address)

  /**
   * Fetch token balances from GalaChain with metadata (name, symbol, image, etc.)
   */
  async function fetchTokens(): Promise<void> {
    if (!walletStore.connected || !walletStore.address) {
      return
    }

    tokensStore.setLoading(true)
    tokensStore.setError(null)

    try {
      // Use getBalancesWithMetadata to get token class info (name, symbol, image)
      const result = await galaChain.getBalancesWithMetadata(walletStore.address!)

      if (result.success) {
        tokensStore.setBalancesWithMetadata(result.data)
      } else {
        tokensStore.setError(result.error)
      }
    } catch (err) {
      tokensStore.setError(
        err instanceof Error ? err.message : 'Failed to fetch token balances'
      )
    } finally {
      tokensStore.setLoading(false)
    }
  }

  /**
   * Fetch allowances from GalaChain
   * Fetches allowances granted TO the user (received allowances)
   *
   * Note: GalaChain FetchAllowances API requires grantedTo, so we cannot
   * directly query for allowances granted BY the user. The "granted" tab
   * will display an informational message about this limitation.
   */
  async function fetchAllowances(): Promise<void> {
    if (!walletStore.connected || !walletStore.address) {
      return
    }

    tokensStore.setLoadingAllowances(true)

    try {
      // Fetch allowances granted TO the user (user is grantedTo)
      const result = await galaChain.getAllowances(walletStore.address!)

      if (result.success) {
        // Pass the allowances with the allowance type enums
        tokensStore.setAllowancesReceived(
          result.data,
          AllowanceType.Mint,
          AllowanceType.Burn
        )
      }

      // Note: GalaChain API doesn't support querying by grantedBy without grantedTo
      // So we can't fetch allowances granted BY the user
      // We set an empty array for granted allowances
      tokensStore.setAllowancesGranted([])
    } catch {
      // Silently fail for allowances - they're supplementary data
      console.warn('Failed to fetch allowances')
    } finally {
      tokensStore.setLoadingAllowances(false)
    }
  }

  /**
   * Fetch both tokens and allowances
   */
  async function fetchAll(): Promise<void> {
    await Promise.all([fetchTokens(), fetchAllowances()])
  }

  /**
   * Refresh token data if needed
   */
  async function refresh(force: boolean = false): Promise<void> {
    if (force || tokensStore.needsRefresh()) {
      await fetchAll()
    }
  }

  /**
   * Update sort order
   */
  function setSort(option: TokenSortOption): void {
    tokensStore.setSort(option)
  }

  /**
   * Get a token by its key
   */
  function getToken(tokenKey: string) {
    return tokensStore.getTokenByKey(tokenKey)
  }

  /**
   * Clear all token data (called on disconnect)
   */
  function clearTokens(): void {
    tokensStore.clearTokens()
  }

  // Watch for wallet connection changes
  watch(
    () => walletStore.connected,
    (connected) => {
      if (connected) {
        // Fetch tokens when wallet connects
        fetchAll()
      } else {
        // Clear tokens when wallet disconnects
        clearTokens()
      }
    },
    { immediate: false }
  )

  // Watch for wallet address changes (account switch)
  watch(
    () => walletStore.address,
    (newAddress, oldAddress) => {
      if (newAddress && newAddress !== oldAddress) {
        // Refetch tokens when address changes
        fetchAll()
      }
    }
  )

  return {
    // State from store
    tokens,
    allowances, // Combined for backward compatibility
    allowancesReceived,
    allowancesGranted,
    isLoading,
    isLoadingAllowances,
    error,
    sortBy,
    hasTokens,
    mintableTokens,
    burnableTokens,

    // Wallet state
    isConnected,
    walletAddress,

    // Actions
    fetchTokens,
    fetchAllowances,
    fetchAll,
    refresh,
    setSort,
    getToken,
    clearTokens,
  }
}

// Export type for use in components
export type UseFungibleTokens = ReturnType<typeof useFungibleTokens>
