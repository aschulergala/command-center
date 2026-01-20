/**
 * Tests for useCreateCollection composable
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useCreateCollection } from '@/composables/useCreateCollection'
import type { CreateCollectionFormValues } from '@/lib/schemas/createCollectionSchema'

// Mock galachainClient
const mockCreateCollection = vi.fn()

vi.mock('@/lib/galachainClient', () => ({
  createCollection: (...args: unknown[]) => mockCreateCollection(...args),
}))

// Mock wallet store
const mockWalletStore = {
  connected: true,
  address: 'client|creator12345678901234567890',
  getClient: vi.fn(() => ({})),
}

vi.mock('@/stores/wallet', () => ({
  useWalletStore: () => mockWalletStore,
}))

// Mock error handling
vi.mock('@/lib/galachainErrors', () => ({
  GalaChainError: class GalaChainError extends Error {
    constructor(message: string) {
      super(message)
      this.name = 'GalaChainError'
    }
  },
  parseWalletError: (err: unknown) => err instanceof Error ? err.message : 'Unknown error',
  logError: vi.fn(),
}))

describe('useCreateCollection', () => {
  const validFormValues: CreateCollectionFormValues = {
    collection: 'my-collection',
    category: 'Item',
    type: 'nft',
    additionalKey: 'none',
    name: 'My Collection',
    symbol: 'MC',
    description: 'A test collection',
    image: 'https://example.com/image.png',
    isNonFungible: true,
    decimals: 0,
    maxSupply: '',
  }

  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    mockCreateCollection.mockReset()
    mockWalletStore.connected = true
    mockWalletStore.getClient = vi.fn(() => ({}))
  })

  describe('buildCreateInput', () => {
    it('should build correct input from form values', () => {
      const { buildCreateInput } = useCreateCollection()
      const result = buildCreateInput(validFormValues)

      expect(result).toEqual({
        tokenClass: {
          collection: 'my-collection',
          category: 'Item',
          type: 'nft',
          additionalKey: 'none',
        },
        name: 'My Collection',
        symbol: 'MC',
        description: 'A test collection',
        image: 'https://example.com/image.png',
        isNonFungible: true,
        decimals: 0,
      })
    })

    it('should uppercase symbol', () => {
      const { buildCreateInput } = useCreateCollection()
      const values = { ...validFormValues, symbol: 'abc' }
      const result = buildCreateInput(values)

      expect(result.symbol).toBe('ABC')
    })

    it('should include max supply when provided', () => {
      const { buildCreateInput } = useCreateCollection()
      const values = { ...validFormValues, maxSupply: '1000' }
      const result = buildCreateInput(values)

      expect(result.maxSupply).toBeDefined()
      expect(result.maxSupply?.toString()).toBe('1000')
    })

    it('should not include max supply when empty', () => {
      const { buildCreateInput } = useCreateCollection()
      const values = { ...validFormValues, maxSupply: '' }
      const result = buildCreateInput(values)

      expect(result.maxSupply).toBeUndefined()
    })

    it('should use 0 decimals for NFT collections', () => {
      const { buildCreateInput } = useCreateCollection()
      const values = { ...validFormValues, isNonFungible: true, decimals: 8 }
      const result = buildCreateInput(values)

      expect(result.decimals).toBe(0)
    })

    it('should preserve decimals for fungible tokens', () => {
      const { buildCreateInput } = useCreateCollection()
      const values = { ...validFormValues, isNonFungible: false, decimals: 8 }
      const result = buildCreateInput(values)

      expect(result.decimals).toBe(8)
    })

    it('should default additionalKey to "none"', () => {
      const { buildCreateInput } = useCreateCollection()
      const values = { ...validFormValues, additionalKey: '' }
      const result = buildCreateInput(values)

      expect(result.tokenClass.additionalKey).toBe('none')
    })
  })

  describe('executeCreate', () => {
    it('should call createCollection with correct parameters on success', async () => {
      const mockTokenClass = { name: 'My Collection' }
      mockCreateCollection.mockResolvedValue(mockTokenClass)

      const { executeCreate } = useCreateCollection()
      const result = await executeCreate(validFormValues)

      expect(mockCreateCollection).toHaveBeenCalledWith(
        expect.any(Object), // client
        expect.objectContaining({
          tokenClass: {
            collection: 'my-collection',
            category: 'Item',
            type: 'nft',
            additionalKey: 'none',
          },
          name: 'My Collection',
          symbol: 'MC',
        })
      )
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toBe(mockTokenClass)
      }
    })

    it('should return error when wallet not connected', async () => {
      mockWalletStore.getClient = vi.fn(() => null)

      const { executeCreate } = useCreateCollection()
      const result = await executeCreate(validFormValues)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toContain('Wallet not connected')
      }
      expect(mockCreateCollection).not.toHaveBeenCalled()
    })

    it('should return error result on API failure', async () => {
      const error = new Error('Collection already exists')
      mockCreateCollection.mockRejectedValue(error)

      const { executeCreate } = useCreateCollection()
      const result = await executeCreate(validFormValues)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toBe('Collection already exists')
      }
    })

    it('should update isCreating state during creation', async () => {
      let resolveCreate: (value: unknown) => void = () => {}
      mockCreateCollection.mockReturnValue(
        new Promise((resolve) => {
          resolveCreate = resolve
        })
      )

      const { executeCreate, isCreating } = useCreateCollection()

      expect(isCreating.value).toBe(false)

      const createPromise = executeCreate(validFormValues)

      expect(isCreating.value).toBe(true)

      resolveCreate({ name: 'Test' })
      await createPromise

      expect(isCreating.value).toBe(false)
    })

    it('should reset isCreating on error', async () => {
      mockCreateCollection.mockRejectedValue(new Error('Failed'))

      const { executeCreate, isCreating } = useCreateCollection()

      await executeCreate(validFormValues)

      expect(isCreating.value).toBe(false)
    })

    it('should set error state on failure', async () => {
      mockCreateCollection.mockRejectedValue(new Error('Creation failed'))

      const { executeCreate, error } = useCreateCollection()

      await executeCreate(validFormValues)

      expect(error.value).toBe('Creation failed')
    })
  })

  describe('getCollectionKey', () => {
    it('should generate correct collection key string', () => {
      const { getCollectionKey } = useCreateCollection()
      const key = getCollectionKey(validFormValues)

      expect(key).toBe('my-collection|Item|nft|none')
    })

    it('should handle empty values', () => {
      const { getCollectionKey } = useCreateCollection()
      const key = getCollectionKey({})

      expect(key).toBe('|||none')
    })

    it('should use "none" for missing additionalKey', () => {
      const { getCollectionKey } = useCreateCollection()
      const key = getCollectionKey({
        collection: 'test',
        category: 'Cat',
        type: 'Type',
      })

      expect(key).toBe('test|Cat|Type|none')
    })
  })

  describe('clearError', () => {
    it('should clear error state', async () => {
      mockCreateCollection.mockRejectedValue(new Error('Test error'))

      const { executeCreate, error, clearError } = useCreateCollection()

      await executeCreate(validFormValues)
      expect(error.value).toBe('Test error')

      clearError()
      expect(error.value).toBeNull()
    })
  })

  describe('computed properties', () => {
    it('should return connected status', () => {
      const { isConnected } = useCreateCollection()
      expect(isConnected.value).toBe(true)
    })

    it('should return wallet address', () => {
      const { walletAddress } = useCreateCollection()
      expect(walletAddress.value).toBe('client|creator12345678901234567890')
    })

    it('should combine loading states', () => {
      const { isLoading, isCreating } = useCreateCollection()
      expect(isLoading.value).toBe(false)
      expect(isCreating.value).toBe(false)
    })
  })
})
