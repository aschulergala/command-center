/**
 * Composable for managing token classes within a collection
 *
 * Provides functionality to:
 * - Create new classes within a collection
 * - List existing classes (from balances data)
 * - Validate class creation inputs
 */

import { ref, computed } from 'vue'
import { useWalletStore } from '@/stores/wallet'
import { createCollection, type CreateTokenClassInput } from '@/lib/galachainClient'
import type { CreatorCollectionDisplay, CreatorClassDisplay } from '@/stores/creatorCollections'
import BigNumber from 'bignumber.js'

/**
 * Input for creating a new class
 */
export interface CreateClassInput {
  /** Parent collection info */
  collection: string
  category: string
  type: string
  /** The additionalKey that identifies this specific class */
  additionalKey: string
  /** Human-readable name */
  name: string
  /** Description of the class */
  description: string
  /** Image URL */
  image: string
  /** Max supply (0 or empty = unlimited) */
  maxSupply?: string
  /** Rarity level */
  rarity?: string
}

/**
 * Result of class creation
 */
export interface CreateClassResult {
  success: boolean
  classKey?: string
  error?: string
}

/**
 * Composable for managing classes within collections
 */
export function useManageClasses() {
  const walletStore = useWalletStore()

  // Reactive state
  const isCreating = ref(false)
  const error = ref<string | null>(null)

  // Computed
  const isConnected = computed(() => walletStore.connected)
  const walletAddress = computed(() => walletStore.address)

  /**
   * Build CreateTokenClassInput from our input
   */
  function buildCreateInput(input: CreateClassInput): CreateTokenClassInput {
    const result: CreateTokenClassInput = {
      tokenClass: {
        collection: input.collection,
        category: input.category,
        type: input.type,
        additionalKey: input.additionalKey,
      },
      name: input.name,
      symbol: input.type, // Use type as symbol for classes
      description: input.description || '',
      image: input.image || '',
      isNonFungible: true, // Classes within NFT collections are always non-fungible
      decimals: 0,
    }

    // Add optional max supply
    if (input.maxSupply && input.maxSupply.trim() !== '') {
      const supply = parseInt(input.maxSupply, 10)
      if (!isNaN(supply) && supply > 0) {
        result.maxSupply = new BigNumber(supply)
      }
    }

    // Add optional rarity
    if (input.rarity && input.rarity.trim() !== '') {
      result.rarity = input.rarity.trim()
    }

    return result
  }

  /**
   * Create a new class within a collection
   */
  async function createClass(input: CreateClassInput): Promise<CreateClassResult> {
    error.value = null

    if (!walletStore.connected) {
      error.value = 'Wallet not connected'
      return { success: false, error: error.value }
    }

    const client = walletStore.getClient()
    if (!client) {
      error.value = 'Failed to get wallet client'
      return { success: false, error: error.value }
    }

    isCreating.value = true

    try {
      const createInput = buildCreateInput(input)
      await createCollection(client, createInput)

      const classKey = `${input.collection}|${input.category}|${input.type}|${input.additionalKey}`

      return {
        success: true,
        classKey,
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create class'
      error.value = message
      return { success: false, error: message }
    } finally {
      isCreating.value = false
    }
  }

  /**
   * Get the class key preview from inputs
   */
  function getClassKeyPreview(
    collection: CreatorCollectionDisplay,
    additionalKey: string
  ): string {
    return `${collection.collection}|${collection.category}|${collection.type}|${additionalKey}`
  }

  /**
   * Validate if an additionalKey is valid for this collection
   * (doesn't already exist)
   */
  function isAdditionalKeyAvailable(
    collection: CreatorCollectionDisplay,
    additionalKey: string
  ): boolean {
    // Check if this additionalKey already exists in the collection's classes
    return !collection.classes.some(
      (c: CreatorClassDisplay) => c.additionalKey === additionalKey
    )
  }

  /**
   * Reset error state
   */
  function clearError() {
    error.value = null
  }

  return {
    // State
    isCreating,
    error,

    // Computed
    isConnected,
    walletAddress,

    // Actions
    createClass,
    buildCreateInput,
    getClassKeyPreview,
    isAdditionalKeyAvailable,
    clearError,
  }
}
