/**
 * Composable for token burn operations
 *
 * Provides a reactive interface for burning fungible tokens
 * with integrated wallet signing and error handling.
 */

import { ref, computed } from 'vue'
import { useGalaChain } from '@/composables/useGalaChain'
import { useWalletStore } from '@/stores/wallet'
import type { FungibleTokenDisplay } from '@shared/types/display'

export interface BurnResult {
  success: boolean
  error?: string
}

/**
 * Token instance key structure for burn operations
 */
export interface TokenInstanceKey {
  collection: string
  category: string
  type: string
  additionalKey: string
  instance: string
}

/**
 * Composable for burning tokens
 */
export function useBurnToken() {
  const { burnTokens, isLoading: galaChainLoading, error: galaChainError } = useGalaChain()
  const walletStore = useWalletStore()

  // Local state for burn operation
  const isBurning = ref(false)
  const burnError = ref<string | null>(null)

  // Computed: combined loading state
  const isLoading = computed(() => isBurning.value || galaChainLoading.value)

  // Computed: combined error state
  const error = computed(() => burnError.value || galaChainError.value)

  // Computed: whether the wallet is connected
  const isConnected = computed(() => walletStore.connected)

  // Computed: current wallet address (owner of tokens being burned)
  const ownerAddress = computed(() => walletStore.address || '')

  /**
   * Clear the error state
   */
  function clearError() {
    burnError.value = null
  }

  /**
   * Build a TokenInstanceKey from a FungibleTokenDisplay
   * For fungible tokens, instance is typically '0' or not specified
   */
  function buildTokenInstanceKey(token: FungibleTokenDisplay): TokenInstanceKey {
    return {
      collection: token.collection,
      category: token.category,
      type: token.type,
      additionalKey: token.additionalKey,
      instance: '0', // Fungible tokens use instance 0
    }
  }

  /**
   * Execute a token burn operation
   *
   * @param token - The token to burn
   * @param amount - The amount to burn (as string)
   * @returns BurnResult indicating success or failure
   */
  async function executeBurn(
    token: FungibleTokenDisplay,
    amount: string
  ): Promise<BurnResult> {
    clearError()
    isBurning.value = true

    try {
      // Validate wallet connection
      if (!walletStore.connected || !walletStore.address) {
        burnError.value = 'Wallet not connected. Please connect your wallet first.'
        return { success: false, error: burnError.value }
      }

      // Build token instance key for burn
      const tokenInstanceKey = buildTokenInstanceKey(token)

      // Execute the burn via GalaChain
      // burnTokens expects an array of { tokenInstanceKey, quantity }
      const result = await burnTokens([
        {
          tokenInstanceKey,
          quantity: amount,
        },
      ])

      if (result.success) {
        return { success: true }
      } else {
        burnError.value = result.error
        return { success: false, error: result.error }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred'
      burnError.value = errorMessage
      return { success: false, error: errorMessage }
    } finally {
      isBurning.value = false
    }
  }

  return {
    // State
    isLoading,
    isBurning,
    error,
    burnError,
    isConnected,
    ownerAddress,

    // Actions
    executeBurn,
    clearError,
    buildTokenInstanceKey,
  }
}

export type UseBurnToken = ReturnType<typeof useBurnToken>
