/**
 * Composable for creating new token collections/classes
 *
 * Handles the creation of new NFT or fungible token collections on GalaChain.
 */

import { ref, computed } from 'vue'
import { useWalletStore } from '@/stores/wallet'
import { createCollection, type CreateTokenClassInput, type TokenClass } from '@/lib/galachainClient'
import { GalaChainError, parseWalletError, logError } from '@/lib/galachainErrors'
import type { CreateCollectionFormValues } from '@/lib/schemas/createCollectionSchema'
import BigNumber from 'bignumber.js'

/**
 * Result of the create collection operation
 */
export type CreateCollectionResult =
  | { success: true; data: TokenClass }
  | { success: false; error: string }

/**
 * Composable for creating token collections
 */
export function useCreateCollection() {
  const walletStore = useWalletStore()

  // Reactive state
  const isCreating = ref(false)
  const error = ref<string | null>(null)

  // Computed
  const isConnected = computed(() => walletStore.connected)
  const walletAddress = computed(() => walletStore.address)
  const isLoading = computed(() => isCreating.value)

  /**
   * Clear the current error state
   */
  function clearError() {
    error.value = null
  }

  /**
   * Build the CreateTokenClassInput from form values
   */
  function buildCreateInput(formValues: CreateCollectionFormValues): CreateTokenClassInput {
    const input: CreateTokenClassInput = {
      tokenClass: {
        collection: formValues.collection,
        category: formValues.category,
        type: formValues.type,
        additionalKey: formValues.additionalKey || 'none',
      },
      name: formValues.name,
      symbol: formValues.symbol.toUpperCase(),
      description: formValues.description || '',
      image: formValues.image,
      isNonFungible: formValues.isNonFungible,
      decimals: formValues.isNonFungible ? 0 : (formValues.decimals || 0),
    }

    // Add max supply if specified
    if (formValues.maxSupply && formValues.maxSupply !== '' && formValues.maxSupply !== '0') {
      input.maxSupply = new BigNumber(formValues.maxSupply)
    }

    return input
  }

  /**
   * Execute the collection creation
   */
  async function executeCreate(
    formValues: CreateCollectionFormValues
  ): Promise<CreateCollectionResult> {
    // Validate wallet connection
    const client = walletStore.getClient()
    if (!client) {
      const errorMsg = 'Wallet not connected. Please connect your wallet first.'
      error.value = errorMsg
      return { success: false, error: errorMsg }
    }

    isCreating.value = true
    error.value = null

    try {
      const input = buildCreateInput(formValues)
      const result = await createCollection(client, input)

      return { success: true, data: result }
    } catch (err) {
      logError('createCollection', err)

      const errorMessage =
        err instanceof GalaChainError
          ? err.message
          : parseWalletError(err)

      error.value = errorMessage
      return { success: false, error: errorMessage }
    } finally {
      isCreating.value = false
    }
  }

  /**
   * Validate that a collection key combination is unique (basic client-side check)
   * Note: The actual uniqueness is enforced by the blockchain
   */
  function getCollectionKey(formValues: Partial<CreateCollectionFormValues>): string {
    const parts = [
      formValues.collection || '',
      formValues.category || '',
      formValues.type || '',
      formValues.additionalKey || 'none',
    ]
    return parts.join('|')
  }

  /**
   * Check if the form values would create an NFT collection
   */
  function isNFTCollection(formValues: Partial<CreateCollectionFormValues>): boolean {
    return formValues.isNonFungible !== false
  }

  return {
    // State
    isCreating,
    isLoading,
    error,

    // Computed
    isConnected,
    walletAddress,

    // Actions
    clearError,
    executeCreate,
    buildCreateInput,
    getCollectionKey,
    isNFTCollection,
  }
}

// Export type for component use
export type UseCreateCollection = ReturnType<typeof useCreateCollection>
