/**
 * Composable for checking NFT mint authority (collection-based mint allowances)
 *
 * NFT minting is authorized at the collection level (TokenClass), not individual instances.
 * This composable checks allowances to determine which collections the user can mint from.
 */

import { computed } from 'vue'
import { useTokensStore } from '@/stores/tokens'
import { useNFTsStore } from '@/stores/nfts'
import { useWalletStore } from '@/stores/wallet'
import BigNumber from 'bignumber.js'
import { AllowanceType } from '@gala-chain/api'
import type { AllowanceDisplay, CollectionDisplay } from '@shared/types/display'

/**
 * Collection mint authority information
 */
export interface CollectionMintAuthority {
  /** The collection key */
  collectionKey: string
  /** Collection details */
  collection: CollectionDisplay
  /** Whether the user can mint from this collection */
  canMint: boolean
  /** Remaining mint allowance (as BigNumber) */
  mintAllowanceRemaining: BigNumber | null
  /** Formatted mint allowance for display */
  mintAllowanceFormatted: string | null
  /** The mint allowance details */
  mintAllowance: AllowanceDisplay | null
}

/**
 * Composable for checking NFT mint authority
 */
export function useNFTMintAuthority() {
  const tokensStore = useTokensStore()
  const nftsStore = useNFTsStore()
  const walletStore = useWalletStore()

  // Computed: user's wallet address
  const walletAddress = computed(() => walletStore.address)

  // Computed: whether user is connected
  const isConnected = computed(() => walletStore.connected)

  /**
   * Get all NFT mint allowances (allowances for non-fungible token classes)
   * NFT mint allowances have instance = 0 (indicating they apply to any/new instances)
   */
  const nftMintAllowances = computed(() => {
    return tokensStore.allowances.filter(
      (a) =>
        a.allowanceType === AllowanceType.Mint &&
        !a.isExpired &&
        // NFT mint allowances: instance is 0 or not specified
        (a.instance === '0' || a.instance === '' || !a.instance)
    )
  })

  /**
   * Get collections that the user can mint from (has mint allowance)
   */
  const authorizedCollections = computed((): CollectionDisplay[] => {
    const mintableCollectionKeys = new Set<string>()

    // Find collections where user has mint allowance
    for (const allowance of nftMintAllowances.value) {
      const remaining = new BigNumber(allowance.quantityRemainingRaw)
      if (remaining.isGreaterThan(0)) {
        const collectionKey = `${allowance.collection}|${allowance.category}|${allowance.type}|${allowance.additionalKey}`
        mintableCollectionKeys.add(collectionKey)
      }
    }

    // Return full collection info for authorized collections
    // First check known collections from NFTs store
    const knownCollections = nftsStore.collections.filter((c) =>
      mintableCollectionKeys.has(c.collectionKey)
    )

    // If we have allowances for collections not in our NFT list, create placeholder entries
    const knownKeys = new Set(knownCollections.map((c) => c.collectionKey))
    const unknownCollections: CollectionDisplay[] = []

    for (const allowance of nftMintAllowances.value) {
      const remaining = new BigNumber(allowance.quantityRemainingRaw)
      if (remaining.isGreaterThan(0)) {
        const collectionKey = `${allowance.collection}|${allowance.category}|${allowance.type}|${allowance.additionalKey}`
        if (!knownKeys.has(collectionKey)) {
          unknownCollections.push({
            collectionKey,
            collection: allowance.collection,
            category: allowance.category,
            type: allowance.type,
            additionalKey: allowance.additionalKey,
            name: allowance.type || 'Unknown Collection',
            symbol: allowance.type || '???',
            description: '',
            image: '',
            isNonFungible: true,
            maxSupply: '0',
            totalSupply: '0',
            totalBurned: '0',
            isAuthority: true,
            ownedCount: 0,
          })
          knownKeys.add(collectionKey)
        }
      }
    }

    return [...knownCollections, ...unknownCollections]
  })

  /**
   * Check if user has any NFT mint authority
   */
  const hasAnyMintAuthority = computed(() => authorizedCollections.value.length > 0)

  /**
   * Get mint allowance for a specific collection
   */
  function getMintAllowance(collection: CollectionDisplay): AllowanceDisplay | null {
    return (
      nftMintAllowances.value.find(
        (a) =>
          a.collection === collection.collection &&
          a.category === collection.category &&
          a.type === collection.type &&
          a.additionalKey === collection.additionalKey
      ) || null
    )
  }

  /**
   * Get remaining mint allowance for a collection
   */
  function getMintAllowanceRemaining(collection: CollectionDisplay): BigNumber | null {
    const allowance = getMintAllowance(collection)
    if (!allowance) return null

    const remaining = new BigNumber(allowance.quantityRemainingRaw)
    return remaining.isGreaterThan(0) ? remaining : null
  }

  /**
   * Get formatted mint allowance for a collection
   */
  function getMintAllowanceFormatted(collection: CollectionDisplay): string | null {
    const allowance = getMintAllowance(collection)
    if (!allowance) return null
    return allowance.quantityRemainingFormatted
  }

  /**
   * Check if user can mint from a specific collection
   */
  function canMintFromCollection(collection: CollectionDisplay): boolean {
    const remaining = getMintAllowanceRemaining(collection)
    return remaining !== null && remaining.isGreaterThan(0)
  }

  /**
   * Get comprehensive mint authority info for a collection
   */
  function getCollectionMintAuthority(collection: CollectionDisplay): CollectionMintAuthority {
    const mintAllowance = getMintAllowance(collection)
    const mintAllowanceRemaining = getMintAllowanceRemaining(collection)

    return {
      collectionKey: collection.collectionKey,
      collection,
      canMint: canMintFromCollection(collection),
      mintAllowanceRemaining,
      mintAllowanceFormatted: getMintAllowanceFormatted(collection),
      mintAllowance,
    }
  }

  /**
   * Check if a mint quantity is valid (positive, integer for NFTs, and within allowance)
   */
  function isValidMintQuantity(collection: CollectionDisplay, quantity: string): boolean {
    const mintAllowanceRemaining = getMintAllowanceRemaining(collection)
    if (!mintAllowanceRemaining) return false

    const quantityBN = new BigNumber(quantity)

    // NFT quantity must be positive integer
    if (quantityBN.isNaN() || quantityBN.isLessThanOrEqualTo(0)) return false
    if (!quantityBN.isInteger()) return false

    return quantityBN.isLessThanOrEqualTo(mintAllowanceRemaining)
  }

  return {
    // State
    walletAddress,
    isConnected,

    // Computed lists
    nftMintAllowances,
    authorizedCollections,
    hasAnyMintAuthority,

    // Check functions
    getMintAllowance,
    getMintAllowanceRemaining,
    getMintAllowanceFormatted,
    canMintFromCollection,
    getCollectionMintAuthority,

    // Validation functions
    isValidMintQuantity,
  }
}

export type UseNFTMintAuthority = ReturnType<typeof useNFTMintAuthority>
