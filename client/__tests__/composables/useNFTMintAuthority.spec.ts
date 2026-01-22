/**
 * Tests for useNFTMintAuthority composable
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { AllowanceType } from '@gala-chain/api'
import { useNFTMintAuthority } from '@/composables/useNFTMintAuthority'
import { useTokensStore } from '@/stores/tokens'
import { useNFTsStore } from '@/stores/nfts'
import type { CollectionDisplay, AllowanceDisplay } from '@shared/types/display'

// Mock wallet store
vi.mock('@/stores/wallet', () => ({
  useWalletStore: () => ({
    connected: true,
    address: 'client|user123456789012345678901234567890',
  }),
}))

describe('useNFTMintAuthority', () => {
  const mockCollection: CollectionDisplay = {
    collectionKey: 'TestNFT|Character|Hero|',
    collection: 'TestNFT',
    category: 'Character',
    type: 'Hero',
    additionalKey: '',
    name: 'Test Heroes',
    symbol: 'HERO',
    description: 'Test NFT collection',
    image: '',
    isNonFungible: true,
    maxSupply: '1000',
    totalSupply: '100',
    totalBurned: '0',
    isAuthority: false,
    ownedCount: 5,
  }

  const mockCollection2: CollectionDisplay = {
    ...mockCollection,
    collectionKey: 'OtherNFT|Item|Weapon|',
    collection: 'OtherNFT',
    category: 'Item',
    type: 'Weapon',
    name: 'Weapons Collection',
    symbol: 'WPN',
    ownedCount: 3,
  }

  const mockNFTMintAllowance: AllowanceDisplay = {
    allowanceKey: 'TestNFT|Character|Hero||mint',
    collection: 'TestNFT',
    category: 'Character',
    type: 'Hero',
    additionalKey: '',
    instance: '0', // NFT mint allowances have instance 0
    allowanceType: AllowanceType.Mint,
    grantedBy: 'client|admin12345678901234567890',
    grantedTo: 'client|user123456789012345678901234567890',
    quantityRaw: '50',
    quantitySpentRaw: '10',
    quantityRemainingRaw: '40',
    quantityRemainingFormatted: '40',
    usesRaw: '0',
    usesSpentRaw: '0',
    expires: 0,
    isExpired: false,
    expiresFormatted: 'Never',
  }

  const mockNFTMintAllowance2: AllowanceDisplay = {
    ...mockNFTMintAllowance,
    allowanceKey: 'OtherNFT|Item|Weapon||mint',
    collection: 'OtherNFT',
    category: 'Item',
    type: 'Weapon',
    quantityRaw: '100',
    quantitySpentRaw: '0',
    quantityRemainingRaw: '100',
    quantityRemainingFormatted: '100',
  }

  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  describe('hasAnyMintAuthority', () => {
    it('should return true when user has NFT mint allowances', () => {
      const tokensStore = useTokensStore()
      tokensStore.$patch({
        allowancesReceived: [mockNFTMintAllowance],
      })

      const { hasAnyMintAuthority } = useNFTMintAuthority()
      expect(hasAnyMintAuthority.value).toBe(true)
    })

    it('should return false when user has no mint allowances', () => {
      const tokensStore = useTokensStore()
      tokensStore.$patch({
        allowancesReceived: [],
      })

      const { hasAnyMintAuthority } = useNFTMintAuthority()
      expect(hasAnyMintAuthority.value).toBe(false)
    })

    it('should return false when allowance is expired', () => {
      const tokensStore = useTokensStore()
      tokensStore.$patch({
        allowancesReceived: [{ ...mockNFTMintAllowance, isExpired: true }],
      })

      const { hasAnyMintAuthority } = useNFTMintAuthority()
      expect(hasAnyMintAuthority.value).toBe(false)
    })

    it('should return false when remaining allowance is zero', () => {
      const tokensStore = useTokensStore()
      tokensStore.$patch({
        allowancesReceived: [{ ...mockNFTMintAllowance, quantityRemainingRaw: '0' }],
      })

      const { hasAnyMintAuthority } = useNFTMintAuthority()
      expect(hasAnyMintAuthority.value).toBe(false)
    })
  })

  describe('authorizedCollections', () => {
    it('should return collections user can mint from', () => {
      const tokensStore = useTokensStore()
      const nftsStore = useNFTsStore()

      tokensStore.$patch({
        allowancesReceived: [mockNFTMintAllowance, mockNFTMintAllowance2],
      })
      nftsStore.$patch({
        collections: [mockCollection, mockCollection2],
      })

      const { authorizedCollections } = useNFTMintAuthority()
      expect(authorizedCollections.value).toHaveLength(2)
    })

    it('should create placeholder collection entries for unknown collections', () => {
      const tokensStore = useTokensStore()
      const nftsStore = useNFTsStore()

      tokensStore.$patch({
        allowancesReceived: [mockNFTMintAllowance],
      })
      nftsStore.$patch({
        collections: [], // No known collections
      })

      const { authorizedCollections } = useNFTMintAuthority()
      expect(authorizedCollections.value).toHaveLength(1)
      expect(authorizedCollections.value[0].collection).toBe('TestNFT')
      expect(authorizedCollections.value[0].isAuthority).toBe(true)
    })

    it('should filter out expired allowances', () => {
      const tokensStore = useTokensStore()
      const nftsStore = useNFTsStore()

      tokensStore.$patch({
        allowancesReceived: [
          mockNFTMintAllowance,
          { ...mockNFTMintAllowance2, isExpired: true },
        ],
      })
      nftsStore.$patch({
        collections: [mockCollection, mockCollection2],
      })

      const { authorizedCollections } = useNFTMintAuthority()
      expect(authorizedCollections.value).toHaveLength(1)
      expect(authorizedCollections.value[0].collection).toBe('TestNFT')
    })

    it('should filter out zero remaining allowances', () => {
      const tokensStore = useTokensStore()

      tokensStore.$patch({
        allowancesReceived: [
          mockNFTMintAllowance,
          { ...mockNFTMintAllowance2, quantityRemainingRaw: '0' },
        ],
      })

      const { authorizedCollections } = useNFTMintAuthority()
      expect(authorizedCollections.value).toHaveLength(1)
    })
  })

  describe('getMintAllowance', () => {
    it('should return mint allowance for collection', () => {
      const tokensStore = useTokensStore()
      tokensStore.$patch({
        allowancesReceived: [mockNFTMintAllowance],
      })

      const { getMintAllowance } = useNFTMintAuthority()
      const allowance = getMintAllowance(mockCollection)

      expect(allowance).not.toBeNull()
      expect(allowance?.collection).toBe('TestNFT')
    })

    it('should return null for collection without mint allowance', () => {
      const tokensStore = useTokensStore()
      tokensStore.$patch({
        allowancesReceived: [mockNFTMintAllowance],
      })

      const { getMintAllowance } = useNFTMintAuthority()
      const allowance = getMintAllowance(mockCollection2)

      expect(allowance).toBeNull()
    })
  })

  describe('getMintAllowanceRemaining', () => {
    it('should return remaining allowance as BigNumber', () => {
      const tokensStore = useTokensStore()
      tokensStore.$patch({
        allowancesReceived: [mockNFTMintAllowance],
      })

      const { getMintAllowanceRemaining } = useNFTMintAuthority()
      const remaining = getMintAllowanceRemaining(mockCollection)

      expect(remaining).not.toBeNull()
      expect(remaining!.toString()).toBe('40')
    })

    it('should return null when no allowance exists', () => {
      const tokensStore = useTokensStore()
      tokensStore.$patch({
        allowancesReceived: [],
      })

      const { getMintAllowanceRemaining } = useNFTMintAuthority()
      const remaining = getMintAllowanceRemaining(mockCollection)

      expect(remaining).toBeNull()
    })

    it('should return null when remaining is zero', () => {
      const tokensStore = useTokensStore()
      tokensStore.$patch({
        allowancesReceived: [{ ...mockNFTMintAllowance, quantityRemainingRaw: '0' }],
      })

      const { getMintAllowanceRemaining } = useNFTMintAuthority()
      const remaining = getMintAllowanceRemaining(mockCollection)

      expect(remaining).toBeNull()
    })
  })

  describe('canMintFromCollection', () => {
    it('should return true when user can mint', () => {
      const tokensStore = useTokensStore()
      tokensStore.$patch({
        allowancesReceived: [mockNFTMintAllowance],
      })

      const { canMintFromCollection } = useNFTMintAuthority()
      expect(canMintFromCollection(mockCollection)).toBe(true)
    })

    it('should return false when user cannot mint', () => {
      const tokensStore = useTokensStore()
      tokensStore.$patch({
        allowancesReceived: [],
      })

      const { canMintFromCollection } = useNFTMintAuthority()
      expect(canMintFromCollection(mockCollection)).toBe(false)
    })
  })

  describe('getCollectionMintAuthority', () => {
    it('should return comprehensive mint authority info', () => {
      const tokensStore = useTokensStore()
      tokensStore.$patch({
        allowancesReceived: [mockNFTMintAllowance],
      })

      const { getCollectionMintAuthority } = useNFTMintAuthority()
      const authority = getCollectionMintAuthority(mockCollection)

      expect(authority.canMint).toBe(true)
      expect(authority.mintAllowanceRemaining?.toString()).toBe('40')
      expect(authority.mintAllowanceFormatted).toBe('40')
      expect(authority.mintAllowance).not.toBeNull()
    })

    it('should return info showing no mint authority', () => {
      const tokensStore = useTokensStore()
      tokensStore.$patch({
        allowancesReceived: [],
      })

      const { getCollectionMintAuthority } = useNFTMintAuthority()
      const authority = getCollectionMintAuthority(mockCollection)

      expect(authority.canMint).toBe(false)
      expect(authority.mintAllowanceRemaining).toBeNull()
      expect(authority.mintAllowance).toBeNull()
    })
  })

  describe('isValidMintQuantity', () => {
    beforeEach(() => {
      const tokensStore = useTokensStore()
      tokensStore.$patch({
        allowancesReceived: [mockNFTMintAllowance],
      })
    })

    it('should return true for valid integer quantity', () => {
      const { isValidMintQuantity } = useNFTMintAuthority()
      expect(isValidMintQuantity(mockCollection, '5')).toBe(true)
    })

    it('should return true for quantity equal to allowance', () => {
      const { isValidMintQuantity } = useNFTMintAuthority()
      expect(isValidMintQuantity(mockCollection, '40')).toBe(true)
    })

    it('should return false for quantity exceeding allowance', () => {
      const { isValidMintQuantity } = useNFTMintAuthority()
      expect(isValidMintQuantity(mockCollection, '50')).toBe(false)
    })

    it('should return false for zero quantity', () => {
      const { isValidMintQuantity } = useNFTMintAuthority()
      expect(isValidMintQuantity(mockCollection, '0')).toBe(false)
    })

    it('should return false for negative quantity', () => {
      const { isValidMintQuantity } = useNFTMintAuthority()
      expect(isValidMintQuantity(mockCollection, '-5')).toBe(false)
    })

    it('should return false for fractional quantity (NFTs must be whole numbers)', () => {
      const { isValidMintQuantity } = useNFTMintAuthority()
      expect(isValidMintQuantity(mockCollection, '3.5')).toBe(false)
    })

    it('should return false for invalid number', () => {
      const { isValidMintQuantity } = useNFTMintAuthority()
      expect(isValidMintQuantity(mockCollection, 'invalid')).toBe(false)
    })

    it('should return false when no allowance exists', () => {
      const tokensStore = useTokensStore()
      tokensStore.$patch({
        allowancesReceived: [],
      })

      const { isValidMintQuantity } = useNFTMintAuthority()
      expect(isValidMintQuantity(mockCollection, '5')).toBe(false)
    })
  })

  describe('nftMintAllowances', () => {
    it('should filter for NFT mint allowances (instance 0)', () => {
      const tokensStore = useTokensStore()
      const fungibleMintAllowance: AllowanceDisplay = {
        ...mockNFTMintAllowance,
        allowanceKey: 'GALA|Unit|GALA||mint',
        collection: 'GALA',
        category: 'Unit',
        type: 'GALA',
        instance: '12345', // Specific instance (fungible token)
      }

      tokensStore.$patch({
        allowancesReceived: [mockNFTMintAllowance, fungibleMintAllowance],
      })

      const { nftMintAllowances } = useNFTMintAuthority()
      // Should only include the NFT allowance (instance 0)
      expect(nftMintAllowances.value).toHaveLength(1)
      expect(nftMintAllowances.value[0].instance).toBe('0')
    })

    it('should include allowances with empty instance', () => {
      const tokensStore = useTokensStore()
      const emptyInstanceAllowance: AllowanceDisplay = {
        ...mockNFTMintAllowance,
        instance: '',
      }

      tokensStore.$patch({
        allowancesReceived: [emptyInstanceAllowance],
      })

      const { nftMintAllowances } = useNFTMintAuthority()
      expect(nftMintAllowances.value).toHaveLength(1)
    })

    it('should exclude expired allowances', () => {
      const tokensStore = useTokensStore()
      tokensStore.$patch({
        allowancesReceived: [
          mockNFTMintAllowance,
          { ...mockNFTMintAllowance2, isExpired: true },
        ],
      })

      const { nftMintAllowances } = useNFTMintAuthority()
      expect(nftMintAllowances.value).toHaveLength(1)
    })
  })
})
