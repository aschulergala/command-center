/**
 * Composable for token mint operations
 *
 * Provides a reactive interface for minting fungible tokens
 * with integrated wallet signing and error handling.
 */

import { ref, computed } from 'vue'
import { useGalaChain } from '@/composables/useGalaChain'
import { useWalletStore } from '@/stores/wallet'
import type { FungibleTokenDisplay } from '@shared/types/display'

export interface MintResult {
  success: boolean
  error?: string
}

/**
 * Token class key structure for mint operations
 */
export interface TokenClassKey {
  collection: string
  category: string
  type: string
  additionalKey: string
}

/**
 * Composable for minting tokens
 */
export function useMintToken() {
  const { mintToken, isLoading: galaChainLoading, error: galaChainError } = useGalaChain()
  const walletStore = useWalletStore()

  // Local state for mint operation
  const isMinting = ref(false)
  const mintError = ref<string | null>(null)

  // Computed: combined loading state
  const isLoading = computed(() => isMinting.value || galaChainLoading.value)

  // Computed: combined error state
  const error = computed(() => mintError.value || galaChainError.value)

  // Computed: whether the wallet is connected
  const isConnected = computed(() => walletStore.connected)

  // Computed: current wallet address (recipient of minted tokens)
  const ownerAddress = computed(() => walletStore.address || '')

  /**
   * Clear the error state
   */
  function clearError() {
    mintError.value = null
  }

  /**
   * Build a TokenClassKey from a FungibleTokenDisplay
   */
  function buildTokenClassKey(token: FungibleTokenDisplay): TokenClassKey {
    return {
      collection: token.collection,
      category: token.category,
      type: token.type,
      additionalKey: token.additionalKey,
    }
  }

  /**
   * Execute a token mint operation
   *
   * @param token - The token to mint
   * @param amount - The amount to mint (as string)
   * @param recipient - Optional recipient address (defaults to connected wallet)
   * @returns MintResult indicating success or failure
   */
  async function executeMint(
    token: FungibleTokenDisplay,
    amount: string,
    recipient?: string
  ): Promise<MintResult> {
    clearError()
    isMinting.value = true

    try {
      // Validate wallet connection
      if (!walletStore.connected || !walletStore.address) {
        mintError.value = 'Wallet not connected. Please connect your wallet first.'
        return { success: false, error: mintError.value }
      }

      // Build token class key for mint
      const tokenClassKey = buildTokenClassKey(token)

      // Use specified recipient or default to connected wallet
      const mintRecipient = recipient || walletStore.address

      // Execute the mint via GalaChain
      const result = await mintToken(tokenClassKey, amount, mintRecipient)

      if (result.success) {
        return { success: true }
      } else {
        mintError.value = result.error
        return { success: false, error: result.error }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred'
      mintError.value = errorMessage
      return { success: false, error: errorMessage }
    } finally {
      isMinting.value = false
    }
  }

  return {
    // State
    isLoading,
    isMinting,
    error,
    mintError,
    isConnected,
    ownerAddress,

    // Actions
    executeMint,
    clearError,
    buildTokenClassKey,
  }
}

export type UseMintToken = ReturnType<typeof useMintToken>
