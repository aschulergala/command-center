/**
 * Composable for NFT mint operations
 *
 * Provides a reactive interface for minting NFTs (non-fungible tokens)
 * with integrated wallet signing and error handling.
 */

import { ref, computed } from 'vue'
import { useGalaChain } from '@/composables/useGalaChain'
import { useWalletStore } from '@/stores/wallet'
import type { CollectionDisplay } from '@shared/types/display'

export interface MintNFTResult {
  success: boolean
  /** Array of minted token instance keys */
  mintedInstances?: string[]
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
 * Composable for minting NFTs
 */
export function useMintNFT() {
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

  // Computed: current wallet address (recipient of minted NFTs)
  const ownerAddress = computed(() => walletStore.address || '')

  /**
   * Clear the error state
   */
  function clearError() {
    mintError.value = null
  }

  /**
   * Build a TokenClassKey from a CollectionDisplay
   */
  function buildTokenClassKey(collection: CollectionDisplay): TokenClassKey {
    return {
      collection: collection.collection,
      category: collection.category,
      type: collection.type,
      additionalKey: collection.additionalKey,
    }
  }

  /**
   * Execute an NFT mint operation
   *
   * @param collection - The collection to mint from
   * @param quantity - The number of NFTs to mint (as string)
   * @param recipient - Optional recipient address (defaults to connected wallet)
   * @returns MintNFTResult indicating success or failure
   */
  async function executeMint(
    collection: CollectionDisplay,
    quantity: string,
    recipient?: string
  ): Promise<MintNFTResult> {
    clearError()
    isMinting.value = true

    try {
      // Validate wallet connection
      if (!walletStore.connected || !walletStore.address) {
        mintError.value = 'Wallet not connected. Please connect your wallet first.'
        return { success: false, error: mintError.value }
      }

      // Validate quantity is a positive integer for NFTs
      const quantityNum = parseInt(quantity, 10)
      if (isNaN(quantityNum) || quantityNum <= 0 || !Number.isInteger(quantityNum)) {
        mintError.value = 'Quantity must be a positive whole number.'
        return { success: false, error: mintError.value }
      }

      // Build token class key for mint
      const tokenClassKey = buildTokenClassKey(collection)

      // Use specified recipient or default to connected wallet
      const mintRecipient = recipient || walletStore.address

      // Execute the mint via GalaChain
      const result = await mintToken(tokenClassKey, quantity, mintRecipient)

      if (result.success) {
        // Extract minted instance keys from result
        const mintedInstances = result.data?.map((instance: unknown) => {
          if (typeof instance === 'object' && instance !== null) {
            // TokenInstanceKey has collection, category, type, additionalKey, instance
            const key = instance as {
              collection?: string
              category?: string
              type?: string
              additionalKey?: string
              instance?: { toString(): string }
            }
            return `${key.collection}|${key.category}|${key.type}|${key.additionalKey}|${key.instance?.toString()}`
          }
          return String(instance)
        })

        return { success: true, mintedInstances }
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

export type UseMintNFT = ReturnType<typeof useMintNFT>
