import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useCreatorCollectionsStore, type CollectionSortOption } from '@/stores/creatorCollections'
import { AllowanceType } from '@gala-chain/api'
import type { TokenBalance } from '@gala-chain/connect'
import type { TokenAllowance } from '@gala-chain/api'
import BigNumber from 'bignumber.js'

describe('creatorCollections store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  // Mock mint allowances - collection-level (instance 0)
  const mockMintAllowances: TokenAllowance[] = [
    {
      collection: 'MyNFTCollection',
      category: 'Item',
      type: 'Weapons',
      additionalKey: '',
      instance: new BigNumber(0),
      allowanceType: AllowanceType.Mint,
      grantedBy: 'client|admin',
      grantedTo: 'client|user123',
      quantity: new BigNumber(1000),
      quantitySpent: new BigNumber(50),
      uses: new BigNumber(0),
      usesSpent: new BigNumber(0),
      expires: 0,
    } as unknown as TokenAllowance,
    {
      collection: 'AnotherCollection',
      category: 'Avatar',
      type: 'Characters',
      additionalKey: '',
      instance: new BigNumber(0),
      allowanceType: AllowanceType.Mint,
      grantedBy: 'client|admin',
      grantedTo: 'client|user123',
      quantity: new BigNumber('1e100'), // Unlimited
      quantitySpent: new BigNumber(10),
      uses: new BigNumber(0),
      usesSpent: new BigNumber(0),
      expires: 0,
    } as unknown as TokenAllowance,
  ]

  // Mock instance-level allowance (should be filtered out for collections)
  const mockInstanceAllowance: TokenAllowance = {
    collection: 'InstanceCollection',
    category: 'Item',
    type: 'Token',
    additionalKey: '',
    instance: new BigNumber(123), // Non-zero instance - not collection-level
    allowanceType: AllowanceType.Mint,
    grantedBy: 'client|admin',
    grantedTo: 'client|user123',
    quantity: new BigNumber(5),
    quantitySpent: new BigNumber(0),
    uses: new BigNumber(0),
    usesSpent: new BigNumber(0),
    expires: 0,
  } as unknown as TokenAllowance

  // Mock burn allowance (should be filtered out)
  const mockBurnAllowance: TokenAllowance = {
    collection: 'BurnCollection',
    category: 'Item',
    type: 'Token',
    additionalKey: '',
    instance: new BigNumber(0),
    allowanceType: AllowanceType.Burn,
    grantedBy: 'client|admin',
    grantedTo: 'client|user123',
    quantity: new BigNumber(100),
    quantitySpent: new BigNumber(0),
    uses: new BigNumber(0),
    usesSpent: new BigNumber(0),
    expires: 0,
  } as unknown as TokenAllowance

  // Mock balances for enriching collection data
  const mockBalances: TokenBalance[] = [
    {
      collection: 'MyNFTCollection',
      category: 'Item',
      type: 'Weapons',
      additionalKey: '',
      instanceIds: [new BigNumber(1), new BigNumber(2), new BigNumber(3)],
      quantity: new BigNumber(3),
      lockedHolds: [],
      inUseHolds: [],
    } as unknown as TokenBalance,
  ]

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const store = useCreatorCollectionsStore()
      expect(store.collections).toEqual([])
      expect(store.isLoading).toBe(false)
      expect(store.error).toBe(null)
      expect(store.sortBy).toBe('name-asc')
      expect(store.lastFetched).toBe(null)
    })

    it('should return hasCollections as false initially', () => {
      const store = useCreatorCollectionsStore()
      expect(store.hasCollections).toBe(false)
    })

    it('should return zero count initially', () => {
      const store = useCreatorCollectionsStore()
      expect(store.totalCollectionCount).toBe(0)
    })
  })

  describe('setAllowances action', () => {
    it('should process mint allowances into collections', () => {
      const store = useCreatorCollectionsStore()
      store.setAllowances(mockMintAllowances, AllowanceType.Mint)

      expect(store.collections.length).toBe(2)
      expect(store.hasCollections).toBe(true)
    })

    it('should filter out non-mint allowances', () => {
      const store = useCreatorCollectionsStore()
      store.setAllowances([...mockMintAllowances, mockBurnAllowance], AllowanceType.Mint)

      expect(store.collections.length).toBe(2)
      expect(store.collections.every(c => c.collection !== 'BurnCollection')).toBe(true)
    })

    it('should filter out instance-level allowances', () => {
      const store = useCreatorCollectionsStore()
      store.setAllowances([...mockMintAllowances, mockInstanceAllowance], AllowanceType.Mint)

      expect(store.collections.length).toBe(2)
      expect(store.collections.every(c => c.collection !== 'InstanceCollection')).toBe(true)
    })

    it('should calculate remaining mint allowance', () => {
      const store = useCreatorCollectionsStore()
      store.setAllowances([mockMintAllowances[0]], AllowanceType.Mint)

      const collection = store.collections[0]
      expect(collection.mintAllowanceRaw).toBe('950') // 1000 - 50
      expect(collection.hasUnlimitedMint).toBe(false)
    })

    it('should identify unlimited mint allowance', () => {
      const store = useCreatorCollectionsStore()
      store.setAllowances([mockMintAllowances[1]], AllowanceType.Mint)

      const collection = store.collections[0]
      expect(collection.hasUnlimitedMint).toBe(true)
      expect(collection.mintAllowanceFormatted).toBe('Unlimited')
    })

    it('should set isAuthority to true for all collections', () => {
      const store = useCreatorCollectionsStore()
      store.setAllowances(mockMintAllowances, AllowanceType.Mint)

      expect(store.collections.every(c => c.isAuthority)).toBe(true)
    })

    it('should update lastFetched timestamp', () => {
      const store = useCreatorCollectionsStore()
      store.setAllowances(mockMintAllowances, AllowanceType.Mint)

      expect(store.lastFetched).not.toBe(null)
    })
  })

  describe('setBalances action', () => {
    it('should enrich collection data with owned counts', () => {
      const store = useCreatorCollectionsStore()
      store.setAllowances(mockMintAllowances, AllowanceType.Mint)
      store.setBalances(mockBalances)

      const collection = store.collections.find(c => c.collection === 'MyNFTCollection')
      expect(collection?.ownedCount).toBe(3)
    })

    it('should set ownedCount to 0 for collections without balances', () => {
      const store = useCreatorCollectionsStore()
      store.setAllowances(mockMintAllowances, AllowanceType.Mint)
      store.setBalances([])

      const collection = store.collections.find(c => c.collection === 'MyNFTCollection')
      expect(collection?.ownedCount).toBe(0)
    })
  })

  describe('sortedCollections getter', () => {
    beforeEach(() => {
      const store = useCreatorCollectionsStore()
      store.setAllowances(mockMintAllowances, AllowanceType.Mint)
    })

    it('should sort by name ascending (default)', () => {
      const store = useCreatorCollectionsStore()
      const sorted = store.sortedCollections

      expect(sorted[0].collection).toBe('AnotherCollection')
      expect(sorted[1].collection).toBe('MyNFTCollection')
    })

    it('should sort by name descending', () => {
      const store = useCreatorCollectionsStore()
      store.setSort('name-desc')

      const sorted = store.sortedCollections
      expect(sorted[0].collection).toBe('MyNFTCollection')
      expect(sorted[1].collection).toBe('AnotherCollection')
    })

    it('should sort by minted count descending', () => {
      const store = useCreatorCollectionsStore()
      store.setBalances(mockBalances) // Gives MyNFTCollection 3 owned
      store.setSort('minted-desc')

      const sorted = store.sortedCollections
      expect(sorted[0].collection).toBe('MyNFTCollection')
    })

    it('should sort by minted count ascending', () => {
      const store = useCreatorCollectionsStore()
      store.setBalances(mockBalances) // Gives MyNFTCollection 3 owned
      store.setSort('minted-asc')

      const sorted = store.sortedCollections
      expect(sorted[0].collection).toBe('AnotherCollection')
    })
  })

  describe('setSort action', () => {
    it('should update sortBy state', () => {
      const store = useCreatorCollectionsStore()
      store.setSort('name-desc')
      expect(store.sortBy).toBe('name-desc')
    })
  })

  describe('toggleExpanded action', () => {
    it('should toggle isExpanded for a collection', () => {
      const store = useCreatorCollectionsStore()
      store.setAllowances(mockMintAllowances, AllowanceType.Mint)

      const collectionKey = store.collections[0].collectionKey
      expect(store.collections[0].isExpanded).toBe(false)

      store.toggleExpanded(collectionKey)
      expect(store.collections[0].isExpanded).toBe(true)

      store.toggleExpanded(collectionKey)
      expect(store.collections[0].isExpanded).toBe(false)
    })

    it('should not error for non-existent collection key', () => {
      const store = useCreatorCollectionsStore()
      store.setAllowances(mockMintAllowances, AllowanceType.Mint)

      expect(() => store.toggleExpanded('non-existent')).not.toThrow()
    })
  })

  describe('setLoading action', () => {
    it('should update isLoading state', () => {
      const store = useCreatorCollectionsStore()
      store.setLoading(true)
      expect(store.isLoading).toBe(true)
      store.setLoading(false)
      expect(store.isLoading).toBe(false)
    })
  })

  describe('setError action', () => {
    it('should update error state', () => {
      const store = useCreatorCollectionsStore()
      store.setError('Test error')
      expect(store.error).toBe('Test error')
      store.setError(null)
      expect(store.error).toBe(null)
    })
  })

  describe('clearCollections action', () => {
    it('should reset all state', () => {
      const store = useCreatorCollectionsStore()
      store.setAllowances(mockMintAllowances, AllowanceType.Mint)
      store.setBalances(mockBalances)
      store.setSort('name-desc')
      store.setError('Some error')

      store.clearCollections()

      expect(store.collections).toEqual([])
      expect(store.lastFetched).toBe(null)
      expect(store.error).toBe(null)
      // sortBy should remain as set
    })
  })

  describe('getCollectionByKey action', () => {
    it('should find collection by key', () => {
      const store = useCreatorCollectionsStore()
      store.setAllowances(mockMintAllowances, AllowanceType.Mint)

      const collectionKey = store.collections[0].collectionKey
      const found = store.getCollectionByKey(collectionKey)

      expect(found).toBeDefined()
      expect(found?.collectionKey).toBe(collectionKey)
    })

    it('should return undefined for non-existent key', () => {
      const store = useCreatorCollectionsStore()
      store.setAllowances(mockMintAllowances, AllowanceType.Mint)

      const found = store.getCollectionByKey('non-existent')
      expect(found).toBeUndefined()
    })
  })

  describe('needsRefresh action', () => {
    it('should return true when lastFetched is null', () => {
      const store = useCreatorCollectionsStore()
      expect(store.needsRefresh()).toBe(true)
    })

    it('should return false when recently fetched', () => {
      const store = useCreatorCollectionsStore()
      store.setAllowances(mockMintAllowances, AllowanceType.Mint)

      expect(store.needsRefresh()).toBe(false)
    })
  })
})
