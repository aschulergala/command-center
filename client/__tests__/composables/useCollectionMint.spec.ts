import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useCollectionMint } from '@/composables/useCollectionMint'
import type { CreatorCollectionDisplay, CreatorClassDisplay } from '@/stores/creatorCollections'

// Mock useGalaChain
const mockMintToken = vi.fn()
vi.mock('@/composables/useGalaChain', () => ({
  useGalaChain: () => ({
    mintToken: mockMintToken,
    isLoading: { value: false },
    error: { value: null },
  }),
}))

// Mock wallet store
const mockWalletStore = {
  connected: true,
  address: 'client|test-address',
}

vi.mock('@/stores/wallet', () => ({
  useWalletStore: () => mockWalletStore,
}))

describe('useCollectionMint', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    mockMintToken.mockReset()
    mockWalletStore.connected = true
    mockWalletStore.address = 'client|test-address'
  })

  // Test data
  const mockCollection: CreatorCollectionDisplay = {
    collectionKey: 'TestColl|TestCat|TestType|TestKey',
    collection: 'TestColl',
    category: 'TestCat',
    type: 'TestType',
    additionalKey: 'TestKey',
    name: 'Test Collection',
    symbol: 'TEST',
    description: 'A test collection',
    image: '',
    isNonFungible: true,
    maxSupply: '1000',
    totalSupply: '500',
    totalBurned: '0',
    isAuthority: true,
    ownedCount: 10,
    mintAllowanceRaw: '50',
    mintAllowanceFormatted: '50',
    hasUnlimitedMint: false,
    classes: [],
    isExpanded: false,
  }

  const mockCollectionUnlimited: CreatorCollectionDisplay = {
    ...mockCollection,
    mintAllowanceRaw: '1000000000000000000000000000000000000000000000000000',
    mintAllowanceFormatted: 'Unlimited',
    hasUnlimitedMint: true,
  }

  const mockClass: CreatorClassDisplay = {
    classKey: 'TestColl|TestCat|TestType|ClassKey',
    collection: 'TestColl',
    category: 'TestCat',
    type: 'TestType',
    additionalKey: 'ClassKey',
    name: 'Test Class',
    maxSupply: '100',
    maxSupplyFormatted: '100',
    mintedCount: '30',
    mintedCountFormatted: '30',
    canMintMore: true,
  }

  const mockClassMaxReached: CreatorClassDisplay = {
    ...mockClass,
    mintedCount: '100',
    mintedCountFormatted: '100',
    canMintMore: false,
  }

  describe('buildTokenClassKeyFromCollection', () => {
    it('should build token class key from collection', () => {
      const { buildTokenClassKeyFromCollection } = useCollectionMint()
      const key = buildTokenClassKeyFromCollection(mockCollection)

      expect(key).toEqual({
        collection: 'TestColl',
        category: 'TestCat',
        type: 'TestType',
        additionalKey: 'TestKey',
      })
    })
  })

  describe('buildTokenClassKeyFromClass', () => {
    it('should build token class key from class', () => {
      const { buildTokenClassKeyFromClass } = useCollectionMint()
      const key = buildTokenClassKeyFromClass(mockClass)

      expect(key).toEqual({
        collection: 'TestColl',
        category: 'TestCat',
        type: 'TestType',
        additionalKey: 'ClassKey',
      })
    })
  })

  describe('getMaxMintableQuantity', () => {
    it('should return allowance when less than cap', () => {
      const { getMaxMintableQuantity } = useCollectionMint()
      const max = getMaxMintableQuantity(mockCollection)
      expect(max).toBe(50)
    })

    it('should return cap when allowance exceeds it', () => {
      const { getMaxMintableQuantity } = useCollectionMint()
      const max = getMaxMintableQuantity(mockCollectionUnlimited, 100)
      expect(max).toBe(100)
    })

    it('should respect custom cap', () => {
      const { getMaxMintableQuantity } = useCollectionMint()
      const max = getMaxMintableQuantity(mockCollection, 25)
      expect(max).toBe(25)
    })
  })

  describe('getMaxMintableQuantityForClass', () => {
    it('should return remaining supply when less than cap', () => {
      const { getMaxMintableQuantityForClass } = useCollectionMint()
      // maxSupply 100 - mintedCount 30 = 70 remaining
      const max = getMaxMintableQuantityForClass(mockClass)
      expect(max).toBe(70)
    })

    it('should return cap for unlimited supply class', () => {
      const { getMaxMintableQuantityForClass } = useCollectionMint()
      const unlimitedClass: CreatorClassDisplay = {
        ...mockClass,
        maxSupply: '0',
        maxSupplyFormatted: 'Unlimited',
      }
      const max = getMaxMintableQuantityForClass(unlimitedClass, 100)
      expect(max).toBe(100)
    })

    it('should return 0 when max supply reached', () => {
      const { getMaxMintableQuantityForClass } = useCollectionMint()
      const max = getMaxMintableQuantityForClass(mockClassMaxReached)
      expect(max).toBe(0)
    })
  })

  describe('validateMintQuantity', () => {
    it('should return null for valid quantity', () => {
      const { validateMintQuantity } = useCollectionMint()
      const error = validateMintQuantity('10', '50')
      expect(error).toBeNull()
    })

    it('should reject non-integer quantity', () => {
      const { validateMintQuantity } = useCollectionMint()
      const error = validateMintQuantity('3.5', '50')
      expect(error).toContain('whole number')
    })

    it('should reject zero quantity', () => {
      const { validateMintQuantity } = useCollectionMint()
      const error = validateMintQuantity('0', '50')
      expect(error).toContain('positive')
    })

    it('should reject negative quantity', () => {
      const { validateMintQuantity } = useCollectionMint()
      const error = validateMintQuantity('-5', '50')
      expect(error).toContain('positive')
    })

    it('should reject quantity exceeding allowance', () => {
      const { validateMintQuantity } = useCollectionMint()
      const error = validateMintQuantity('100', '50')
      expect(error).toContain('allowance')
    })

    it('should reject quantity exceeding supply', () => {
      const { validateMintQuantity } = useCollectionMint()
      const error = validateMintQuantity('80', '100', '70')
      expect(error).toContain('supply')
    })

    it('should ignore supply check for unlimited (0) supply', () => {
      const { validateMintQuantity } = useCollectionMint()
      const error = validateMintQuantity('50', '100', '0')
      expect(error).toBeNull()
    })
  })

  describe('executeMintFromCollection', () => {
    it('should successfully mint from collection', async () => {
      mockMintToken.mockResolvedValue({
        success: true,
        data: [
          { collection: 'TestColl', category: 'TestCat', type: 'TestType', additionalKey: 'TestKey', instance: { toString: () => '1' } },
        ],
      })

      const { executeMintFromCollection } = useCollectionMint()
      const result = await executeMintFromCollection(mockCollection, '5')

      expect(result.success).toBe(true)
      expect(result.mintedInstances).toBeDefined()
      expect(mockMintToken).toHaveBeenCalledWith(
        {
          collection: 'TestColl',
          category: 'TestCat',
          type: 'TestType',
          additionalKey: 'TestKey',
        },
        '5',
        'client|test-address'
      )
    })

    it('should fail if wallet not connected', async () => {
      mockWalletStore.connected = false

      const { executeMintFromCollection } = useCollectionMint()
      const result = await executeMintFromCollection(mockCollection, '5')

      expect(result.success).toBe(false)
      expect(result.error).toContain('Wallet not connected')
    })

    it('should fail for invalid quantity', async () => {
      const { executeMintFromCollection } = useCollectionMint()
      const result = await executeMintFromCollection(mockCollection, '0')

      expect(result.success).toBe(false)
      expect(result.error).toContain('positive')
    })

    it('should handle mint error', async () => {
      mockMintToken.mockResolvedValue({
        success: false,
        error: 'Mint failed: insufficient allowance',
      })

      const { executeMintFromCollection } = useCollectionMint()
      const result = await executeMintFromCollection(mockCollection, '5')

      expect(result.success).toBe(false)
      expect(result.error).toContain('Mint failed')
    })
  })

  describe('executeMintFromClass', () => {
    it('should successfully mint from class', async () => {
      mockMintToken.mockResolvedValue({
        success: true,
        data: [
          { collection: 'TestColl', category: 'TestCat', type: 'TestType', additionalKey: 'ClassKey', instance: { toString: () => '31' } },
        ],
      })

      const { executeMintFromClass } = useCollectionMint()
      const result = await executeMintFromClass(mockClass, '1', mockCollection)

      expect(result.success).toBe(true)
      // Should use class's additionalKey, not collection's
      expect(mockMintToken).toHaveBeenCalledWith(
        {
          collection: 'TestColl',
          category: 'TestCat',
          type: 'TestType',
          additionalKey: 'ClassKey',
        },
        '1',
        'client|test-address'
      )
    })

    it('should fail if class cannot mint more', async () => {
      const { executeMintFromClass } = useCollectionMint()
      const result = await executeMintFromClass(mockClassMaxReached, '1', mockCollection)

      expect(result.success).toBe(false)
      expect(result.error).toContain('maximum supply')
    })

    it('should fail if quantity exceeds remaining supply', async () => {
      // Class has 70 remaining (100 - 30), but collection allowance is 50
      // So it should fail with allowance error first (50 < 80)
      // To test supply check, we need collection allowance > class remaining
      const highAllowanceCollection: CreatorCollectionDisplay = {
        ...mockCollection,
        mintAllowanceRaw: '1000',
        mintAllowanceFormatted: '1000',
      }
      const { executeMintFromClass } = useCollectionMint()
      const result = await executeMintFromClass(mockClass, '80', highAllowanceCollection)

      expect(result.success).toBe(false)
      expect(result.error).toContain('supply')
    })
  })

  describe('state management', () => {
    it('should expose connected state', () => {
      const { isConnected } = useCollectionMint()
      expect(isConnected.value).toBe(true)
    })

    it('should expose owner address', () => {
      const { ownerAddress } = useCollectionMint()
      expect(ownerAddress.value).toBe('client|test-address')
    })

    it('should clear error', () => {
      const { mintError, clearError } = useCollectionMint()
      mintError.value = 'Some error'
      clearError()
      expect(mintError.value).toBeNull()
    })
  })
})
