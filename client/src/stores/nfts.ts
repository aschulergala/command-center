import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import BigNumber from 'bignumber.js'
import type { TokenBalance } from '@gala-chain/connect'
import type { TokenAllowance, AllowanceType } from '@gala-chain/api'
import type { NFTDisplay, CollectionDisplay } from '@shared/types/display'

/**
 * Sort options for the NFT list
 */
export type NFTSortOption = 'collection-asc' | 'collection-desc' | 'instance-asc' | 'instance-desc' | 'name-asc' | 'name-desc'

/**
 * Convert a TokenBalance (with NFT instance) to NFTDisplay
 */
function toNFTDisplay(
  balance: TokenBalance,
  instanceId: BigNumber,
  burnAllowances: TokenAllowance[]
): NFTDisplay {
  const instanceKey = `${balance.collection}|${balance.category}|${balance.type}|${balance.additionalKey}|${instanceId.toString()}`

  // Calculate if NFT is locked or in use
  // TokenHold has instanceId (singular) for the specific instance being held
  const lockedInstances = balance.lockedHolds?.map(h => (h as { instanceId?: BigNumber }).instanceId).filter(Boolean) || []
  const inUseInstances = balance.inUseHolds?.map(h => (h as { instanceId?: BigNumber }).instanceId).filter(Boolean) || []

  const isLocked = lockedInstances.some(id => new BigNumber(id?.toString() || '0').eq(instanceId))
  const isInUse = inUseInstances.some(id => new BigNumber(id?.toString() || '0').eq(instanceId))

  // Check for burn allowance for this NFT
  const hasBurnAllowance = burnAllowances.some(
    a => a.collection === balance.collection &&
         a.category === balance.category &&
         a.type === balance.type &&
         a.additionalKey === balance.additionalKey &&
         (a.instance === undefined || new BigNumber(a.instance?.toString() || '0').eq(instanceId) || new BigNumber(a.instance?.toString() || '0').isZero())
  )

  // Can transfer if not locked and not in use
  const canTransfer = !isLocked && !isInUse

  return {
    instanceKey,
    collection: balance.collection,
    category: balance.category,
    type: balance.type,
    additionalKey: balance.additionalKey,
    instance: instanceId.toString(),
    // Name/symbol fallback to type for now (can be enhanced with metadata)
    name: balance.type || 'Unknown NFT',
    symbol: balance.type || '???',
    description: '',
    image: '', // Would come from metadata
    rarity: undefined,
    isLocked,
    isInUse,
    canTransfer,
    canBurn: hasBurnAllowance,
  }
}

/**
 * Extract unique collections from NFT balances
 */
function extractCollections(nfts: NFTDisplay[]): CollectionDisplay[] {
  const collectionMap = new Map<string, CollectionDisplay>()

  for (const nft of nfts) {
    const collectionKey = `${nft.collection}|${nft.category}|${nft.type}|${nft.additionalKey}`

    if (collectionMap.has(collectionKey)) {
      // Increment owned count
      const existing = collectionMap.get(collectionKey)!
      existing.ownedCount++
    } else {
      // Create new collection entry
      collectionMap.set(collectionKey, {
        collectionKey,
        collection: nft.collection,
        category: nft.category,
        type: nft.type,
        additionalKey: nft.additionalKey,
        name: nft.name,
        symbol: nft.symbol,
        description: '',
        image: '',
        isNonFungible: true,
        maxSupply: '0',
        totalSupply: '0',
        totalBurned: '0',
        isAuthority: false, // Would need to check authority
        ownedCount: 1,
      })
    }
  }

  return Array.from(collectionMap.values())
}

/**
 * Pinia store for managing NFT state
 */
export const useNFTsStore = defineStore('nfts', () => {
  // State
  const nfts = ref<NFTDisplay[]>([])
  const collections = ref<CollectionDisplay[]>([])
  const selectedCollection = ref<string | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const sortBy = ref<NFTSortOption>('collection-asc')
  const lastFetched = ref<number | null>(null)

  // Raw data from API (for re-processing when allowances change)
  let rawBalances: TokenBalance[] = []
  let rawBurnAllowances: TokenAllowance[] = []

  // Getters
  const filteredNFTs = computed(() => {
    let result = [...nfts.value]

    // Apply collection filter
    if (selectedCollection.value) {
      result = result.filter(nft => {
        const nftCollectionKey = `${nft.collection}|${nft.category}|${nft.type}|${nft.additionalKey}`
        return nftCollectionKey === selectedCollection.value
      })
    }

    return result
  })

  const sortedNFTs = computed(() => {
    const sorted = [...filteredNFTs.value]

    switch (sortBy.value) {
      case 'collection-asc':
        return sorted.sort((a, b) => {
          const aKey = `${a.collection}|${a.category}|${a.type}|${a.additionalKey}`
          const bKey = `${b.collection}|${b.category}|${b.type}|${b.additionalKey}`
          return aKey.localeCompare(bKey)
        })
      case 'collection-desc':
        return sorted.sort((a, b) => {
          const aKey = `${a.collection}|${a.category}|${a.type}|${a.additionalKey}`
          const bKey = `${b.collection}|${b.category}|${b.type}|${b.additionalKey}`
          return bKey.localeCompare(aKey)
        })
      case 'instance-asc':
        return sorted.sort((a, b) => {
          const aInstance = new BigNumber(a.instance)
          const bInstance = new BigNumber(b.instance)
          const cmp = aInstance.comparedTo(bInstance)
          return cmp === null ? 0 : cmp
        })
      case 'instance-desc':
        return sorted.sort((a, b) => {
          const aInstance = new BigNumber(a.instance)
          const bInstance = new BigNumber(b.instance)
          const cmp = bInstance.comparedTo(aInstance)
          return cmp === null ? 0 : cmp
        })
      case 'name-asc':
        return sorted.sort((a, b) => a.name.localeCompare(b.name))
      case 'name-desc':
        return sorted.sort((a, b) => b.name.localeCompare(a.name))
      default:
        return sorted
    }
  })

  const hasNFTs = computed(() => nfts.value.length > 0)

  const totalNFTCount = computed(() => nfts.value.length)

  const filteredCount = computed(() => filteredNFTs.value.length)

  // Actions

  /**
   * Set the raw balances and process into display NFTs
   */
  function setBalances(balances: TokenBalance[]): void {
    rawBalances = balances
    processNFTs()
  }

  /**
   * Set the raw allowances for burn authority
   */
  function setAllowances(
    allAllowances: TokenAllowance[],
    burnType: AllowanceType
  ): void {
    rawBurnAllowances = allAllowances.filter(a => a.allowanceType === burnType)

    // Re-process NFTs to update canBurn flags
    processNFTs()
  }

  /**
   * Process raw balances into display NFTs
   */
  function processNFTs(): void {
    // Filter for NFT tokens (have instanceIds with non-zero values)
    const nftBalances = rawBalances.filter(b => {
      if (!b.instanceIds || b.instanceIds.length === 0) return false
      // Check if any instance is non-zero (NFTs have non-zero instance IDs)
      return b.instanceIds.some(id => {
        const instance = new BigNumber(id?.toString() || '0')
        return !instance.isZero()
      })
    })

    // Flatten to individual NFT instances
    const nftInstances: NFTDisplay[] = []
    for (const balance of nftBalances) {
      for (const instanceId of balance.instanceIds || []) {
        const instance = new BigNumber(instanceId?.toString() || '0')
        if (!instance.isZero()) {
          nftInstances.push(toNFTDisplay(balance, instance, rawBurnAllowances))
        }
      }
    }

    nfts.value = nftInstances
    collections.value = extractCollections(nftInstances)
    lastFetched.value = Date.now()
  }

  /**
   * Set loading state
   */
  function setLoading(loading: boolean): void {
    isLoading.value = loading
  }

  /**
   * Set error state
   */
  function setError(errorMessage: string | null): void {
    error.value = errorMessage
  }

  /**
   * Update the sort order
   */
  function setSort(option: NFTSortOption): void {
    sortBy.value = option
  }

  /**
   * Set collection filter
   */
  function setCollectionFilter(collectionKey: string | null): void {
    selectedCollection.value = collectionKey
  }

  /**
   * Clear collection filter
   */
  function clearFilter(): void {
    selectedCollection.value = null
  }

  /**
   * Clear all NFT data
   */
  function clearNFTs(): void {
    nfts.value = []
    collections.value = []
    selectedCollection.value = null
    rawBalances = []
    rawBurnAllowances = []
    lastFetched.value = null
    error.value = null
  }

  /**
   * Find an NFT by its key
   */
  function getNFTByKey(instanceKey: string): NFTDisplay | undefined {
    return nfts.value.find(n => n.instanceKey === instanceKey)
  }

  /**
   * Check if data needs refresh (older than 30 seconds)
   */
  function needsRefresh(): boolean {
    if (!lastFetched.value) return true
    return Date.now() - lastFetched.value > 30000
  }

  return {
    // State
    nfts,
    collections,
    selectedCollection,
    isLoading,
    error,
    sortBy,
    lastFetched,

    // Getters
    filteredNFTs,
    sortedNFTs,
    hasNFTs,
    totalNFTCount,
    filteredCount,

    // Actions
    setBalances,
    setAllowances,
    setLoading,
    setError,
    setSort,
    setCollectionFilter,
    clearFilter,
    clearNFTs,
    getNFTByKey,
    needsRefresh,
  }
})

// Export types for testing
export type NFTsStore = ReturnType<typeof useNFTsStore>
