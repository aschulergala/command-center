/**
 * Composable for token transfer operations
 *
 * Provides a reactive interface for transferring fungible tokens
 * with integrated wallet signing and error handling.
 */

import { ref, computed } from 'vue'
import { useGalaChain } from '@/composables/useGalaChain'
import { useWalletStore } from '@/stores/wallet'
import type { FungibleTokenDisplay } from '@shared/types/display'
import type { TokenInstanceInput } from '@/lib/galachainClient'

export interface TransferResult {
  success: boolean
  error?: string
}

/**
 * Composable for transferring tokens
 */
export function useTransferToken() {
  const { transferToken, isLoading: galaChainLoading, error: galaChainError } = useGalaChain()
  const walletStore = useWalletStore()

  // Local state for transfer operation
  const isTransferring = ref(false)
  const transferError = ref<string | null>(null)

  // Computed: combined loading state
  const isLoading = computed(() => isTransferring.value || galaChainLoading.value)

  // Computed: combined error state
  const error = computed(() => transferError.value || galaChainError.value)

  // Computed: whether the wallet is connected
  const isConnected = computed(() => walletStore.connected)

  // Computed: current wallet address
  const fromAddress = computed(() => walletStore.address || '')

  /**
   * Clear the error state
   */
  function clearError() {
    transferError.value = null
  }

  /**
   * Build a TokenInstanceInput from a FungibleTokenDisplay
   */
  function buildTokenInstance(token: FungibleTokenDisplay): TokenInstanceInput {
    return {
      collection: token.collection,
      category: token.category,
      type: token.type,
      additionalKey: token.additionalKey,
      // For fungible tokens, instance is always 0
      instance: '0',
    }
  }

  /**
   * Execute a token transfer
   *
   * @param token - The token to transfer
   * @param recipientAddress - The recipient's GalaChain address
   * @param amount - The amount to transfer (as string)
   * @returns TransferResult indicating success or failure
   */
  async function executeTransfer(
    token: FungibleTokenDisplay,
    recipientAddress: string,
    amount: string
  ): Promise<TransferResult> {
    clearError()
    isTransferring.value = true

    try {
      // Validate wallet connection
      if (!walletStore.connected || !walletStore.address) {
        transferError.value = 'Wallet not connected. Please connect your wallet first.'
        return { success: false, error: transferError.value }
      }

      // Build token instance for transfer
      const tokenInstance = buildTokenInstance(token)

      // Execute the transfer via GalaChain
      const result = await transferToken(recipientAddress, tokenInstance, amount)

      if (result.success) {
        return { success: true }
      } else {
        transferError.value = result.error
        return { success: false, error: result.error }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred'
      transferError.value = errorMessage
      return { success: false, error: errorMessage }
    } finally {
      isTransferring.value = false
    }
  }

  return {
    // State
    isLoading,
    isTransferring,
    error,
    transferError,
    isConnected,
    fromAddress,

    // Actions
    executeTransfer,
    clearError,
    buildTokenInstance,
  }
}

export type UseTransferToken = ReturnType<typeof useTransferToken>
