/**
 * Tests for useManageClasses composable
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useManageClasses, type CreateClassInput } from '@/composables/useManageClasses'
import { useWalletStore } from '@/stores/wallet'
import type { CreatorCollectionDisplay } from '@/stores/creatorCollections'

// Mock the galachainClient
vi.mock('@/lib/galachainClient', () => ({
  createCollection: vi.fn(),
}))

import { createCollection } from '@/lib/galachainClient'

describe('useManageClasses', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  describe('initial state', () => {
    it('has default state values', () => {
      const { isCreating, error, isConnected } = useManageClasses()

      expect(isCreating.value).toBe(false)
      expect(error.value).toBeNull()
      expect(isConnected.value).toBe(false) // wallet not connected
    })
  })

  describe('buildCreateInput', () => {
    it('builds input with required fields', () => {
      const { buildCreateInput } = useManageClasses()

      const input: CreateClassInput = {
        collection: 'MyCollection',
        category: 'NFT',
        type: 'Weapon',
        additionalKey: 'sword',
        name: 'Legendary Sword',
        description: 'A powerful weapon',
        image: '',
      }

      const result = buildCreateInput(input)

      expect(result.tokenClass.collection).toBe('MyCollection')
      expect(result.tokenClass.category).toBe('NFT')
      expect(result.tokenClass.type).toBe('Weapon')
      expect(result.tokenClass.additionalKey).toBe('sword')
      expect(result.name).toBe('Legendary Sword')
      expect(result.symbol).toBe('Weapon') // Uses type as symbol
      expect(result.description).toBe('A powerful weapon')
      expect(result.isNonFungible).toBe(true)
      expect(result.decimals).toBe(0)
    })

    it('includes max supply when provided', () => {
      const { buildCreateInput } = useManageClasses()

      const input: CreateClassInput = {
        collection: 'MyCollection',
        category: 'NFT',
        type: 'Weapon',
        additionalKey: 'sword',
        name: 'Sword',
        description: '',
        image: '',
        maxSupply: '100',
      }

      const result = buildCreateInput(input)

      expect(result.maxSupply?.toString()).toBe('100')
    })

    it('includes rarity when provided', () => {
      const { buildCreateInput } = useManageClasses()

      const input: CreateClassInput = {
        collection: 'MyCollection',
        category: 'NFT',
        type: 'Weapon',
        additionalKey: 'sword',
        name: 'Sword',
        description: '',
        image: '',
        rarity: 'Legendary',
      }

      const result = buildCreateInput(input)

      expect(result.rarity).toBe('Legendary')
    })

    it('excludes max supply when empty', () => {
      const { buildCreateInput } = useManageClasses()

      const input: CreateClassInput = {
        collection: 'MyCollection',
        category: 'NFT',
        type: 'Weapon',
        additionalKey: 'sword',
        name: 'Sword',
        description: '',
        image: '',
        maxSupply: '',
      }

      const result = buildCreateInput(input)

      expect(result.maxSupply).toBeUndefined()
    })
  })

  describe('getClassKeyPreview', () => {
    it('generates correct key preview', () => {
      const { getClassKeyPreview } = useManageClasses()

      const collection: CreatorCollectionDisplay = {
        collectionKey: 'MyCollection|NFT|Weapon|',
        collection: 'MyCollection',
        category: 'NFT',
        type: 'Weapon',
        additionalKey: '',
        name: 'Weapons',
        symbol: 'WPN',
        description: '',
        image: '',
        isNonFungible: true,
        maxSupply: '0',
        totalSupply: '0',
        totalBurned: '0',
        isAuthority: true,
        ownedCount: 0,
        mintAllowanceRaw: '1000',
        mintAllowanceFormatted: '1000',
        hasUnlimitedMint: false,
        classes: [],
        isExpanded: false,
      }

      const result = getClassKeyPreview(collection, 'sword')

      expect(result).toBe('MyCollection|NFT|Weapon|sword')
    })
  })

  describe('isAdditionalKeyAvailable', () => {
    it('returns true when key is available', () => {
      const { isAdditionalKeyAvailable } = useManageClasses()

      const collection: CreatorCollectionDisplay = {
        collectionKey: 'MyCollection|NFT|Weapon|',
        collection: 'MyCollection',
        category: 'NFT',
        type: 'Weapon',
        additionalKey: '',
        name: 'Weapons',
        symbol: 'WPN',
        description: '',
        image: '',
        isNonFungible: true,
        maxSupply: '0',
        totalSupply: '0',
        totalBurned: '0',
        isAuthority: true,
        ownedCount: 0,
        mintAllowanceRaw: '1000',
        mintAllowanceFormatted: '1000',
        hasUnlimitedMint: false,
        classes: [],
        isExpanded: false,
      }

      expect(isAdditionalKeyAvailable(collection, 'newclass')).toBe(true)
    })

    it('returns false when key exists', () => {
      const { isAdditionalKeyAvailable } = useManageClasses()

      const collection: CreatorCollectionDisplay = {
        collectionKey: 'MyCollection|NFT|Weapon|',
        collection: 'MyCollection',
        category: 'NFT',
        type: 'Weapon',
        additionalKey: '',
        name: 'Weapons',
        symbol: 'WPN',
        description: '',
        image: '',
        isNonFungible: true,
        maxSupply: '0',
        totalSupply: '0',
        totalBurned: '0',
        isAuthority: true,
        ownedCount: 0,
        mintAllowanceRaw: '1000',
        mintAllowanceFormatted: '1000',
        hasUnlimitedMint: false,
        classes: [
          {
            classKey: 'MyCollection|NFT|Weapon|sword',
            collection: 'MyCollection',
            category: 'NFT',
            type: 'Weapon',
            additionalKey: 'sword',
            name: 'Sword',
            maxSupply: '0',
            maxSupplyFormatted: 'Unlimited',
            mintedCount: '0',
            mintedCountFormatted: '0',
            canMintMore: true,
          },
        ],
        isExpanded: false,
      }

      expect(isAdditionalKeyAvailable(collection, 'sword')).toBe(false)
    })
  })

  describe('createClass', () => {
    it('returns error when wallet not connected', async () => {
      const { createClass } = useManageClasses()

      const input: CreateClassInput = {
        collection: 'MyCollection',
        category: 'NFT',
        type: 'Weapon',
        additionalKey: 'sword',
        name: 'Sword',
        description: '',
        image: '',
      }

      const result = await createClass(input)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Wallet not connected')
    })

    it('calls createCollection when wallet connected', async () => {
      const walletStore = useWalletStore()
      const mockClient = { send: vi.fn() }
      walletStore.$patch({
        connected: true,
        address: 'client|testaddr',
      })
      // Mock getClient
      vi.spyOn(walletStore, 'getClient').mockReturnValue(mockClient as any)

      vi.mocked(createCollection).mockResolvedValue({} as any)

      const { createClass } = useManageClasses()

      const input: CreateClassInput = {
        collection: 'MyCollection',
        category: 'NFT',
        type: 'Weapon',
        additionalKey: 'sword',
        name: 'Sword',
        description: '',
        image: '',
      }

      const result = await createClass(input)

      expect(createCollection).toHaveBeenCalled()
      expect(result.success).toBe(true)
      expect(result.classKey).toBe('MyCollection|NFT|Weapon|sword')
    })

    it('handles creation error', async () => {
      const walletStore = useWalletStore()
      const mockClient = { send: vi.fn() }
      walletStore.$patch({
        connected: true,
        address: 'client|testaddr',
      })
      vi.spyOn(walletStore, 'getClient').mockReturnValue(mockClient as any)

      vi.mocked(createCollection).mockRejectedValue(new Error('Creation failed'))

      const { createClass, error } = useManageClasses()

      const input: CreateClassInput = {
        collection: 'MyCollection',
        category: 'NFT',
        type: 'Weapon',
        additionalKey: 'sword',
        name: 'Sword',
        description: '',
        image: '',
      }

      const result = await createClass(input)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Creation failed')
      expect(error.value).toBe('Creation failed')
    })
  })

  describe('clearError', () => {
    it('clears the error state', async () => {
      const walletStore = useWalletStore()
      walletStore.$patch({ connected: false })

      const { createClass, error, clearError } = useManageClasses()

      // Trigger an error
      await createClass({
        collection: 'test',
        category: 'test',
        type: 'test',
        additionalKey: 'test',
        name: 'test',
        description: '',
        image: '',
      })

      expect(error.value).not.toBeNull()

      clearError()

      expect(error.value).toBeNull()
    })
  })
})
