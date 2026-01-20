/**
 * Tests for useMintToken composable
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useMintToken } from '@/composables/useMintToken'
import type { FungibleTokenDisplay } from '@shared/types/display'

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
vi.mock('@/stores/wallet', () => ({
  useWalletStore: () => ({
    connected: true,
    address: 'client|owner12345678901234567890',
    getClient: () => ({}),
  }),
}))

describe('useMintToken', () => {
  const mockToken: FungibleTokenDisplay = {
    tokenKey: 'GALA|Unit|GALA|',
    collection: 'GALA',
    category: 'Unit',
    type: 'GALA',
    additionalKey: '',
    name: 'Gala Token',
    symbol: 'GALA',
    description: 'Test token',
    image: '',
    decimals: 8,
    balanceRaw: '100000000000',
    balanceFormatted: '1,000',
    lockedBalanceRaw: '0',
    lockedBalanceFormatted: '0',
    spendableBalanceRaw: '100000000000',
    spendableBalanceFormatted: '1,000',
    canMint: true,
    canBurn: false,
    mintAllowanceRaw: '50000000000',
    mintAllowanceFormatted: '500',
  }

  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    mockMintToken.mockReset()
  })

  describe('buildTokenClassKey', () => {
    it('should build correct token class key from FungibleTokenDisplay', () => {
      const { buildTokenClassKey } = useMintToken()
      const result = buildTokenClassKey(mockToken)

      expect(result).toEqual({
        collection: 'GALA',
        category: 'Unit',
        type: 'GALA',
        additionalKey: '',
      })
    })

    it('should preserve all key components', () => {
      const { buildTokenClassKey } = useMintToken()
      const tokenWithKey = {
        ...mockToken,
        collection: 'MyCollection',
        category: 'MyCategory',
        type: 'MyType',
        additionalKey: 'MyAdditionalKey',
      }
      const result = buildTokenClassKey(tokenWithKey)

      expect(result).toEqual({
        collection: 'MyCollection',
        category: 'MyCategory',
        type: 'MyType',
        additionalKey: 'MyAdditionalKey',
      })
    })
  })

  describe('executeMint', () => {
    it('should call mintToken with correct parameters on success', async () => {
      mockMintToken.mockResolvedValue({ success: true, data: [] })

      const { executeMint } = useMintToken()
      const amount = '100'

      const result = await executeMint(mockToken, amount)

      expect(mockMintToken).toHaveBeenCalledWith(
        {
          collection: 'GALA',
          category: 'Unit',
          type: 'GALA',
          additionalKey: '',
        },
        amount,
        'client|owner12345678901234567890' // Default to connected wallet
      )
      expect(result.success).toBe(true)
    })

    it('should use custom recipient when provided', async () => {
      mockMintToken.mockResolvedValue({ success: true, data: [] })

      const { executeMint } = useMintToken()
      const amount = '100'
      const customRecipient = 'client|customrecipient1234567890'

      await executeMint(mockToken, amount, customRecipient)

      expect(mockMintToken).toHaveBeenCalledWith(
        expect.any(Object),
        amount,
        customRecipient
      )
    })

    it('should return success result on successful mint', async () => {
      mockMintToken.mockResolvedValue({ success: true, data: [] })

      const { executeMint } = useMintToken()
      const result = await executeMint(mockToken, '100')

      expect(result).toEqual({ success: true })
    })

    it('should return error result on failed mint', async () => {
      mockMintToken.mockResolvedValue({ success: false, error: 'Insufficient mint allowance' })

      const { executeMint } = useMintToken()
      const result = await executeMint(mockToken, '100')

      expect(result).toEqual({ success: false, error: 'Insufficient mint allowance' })
    })

    it('should handle thrown errors', async () => {
      mockMintToken.mockRejectedValue(new Error('Network error'))

      const { executeMint } = useMintToken()
      const result = await executeMint(mockToken, '100')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Network error')
    })

    it('should handle non-Error thrown values', async () => {
      mockMintToken.mockRejectedValue('Unknown failure')

      const { executeMint } = useMintToken()
      const result = await executeMint(mockToken, '100')

      expect(result.success).toBe(false)
      expect(result.error).toBe('An unexpected error occurred')
    })

    it('should update isMinting state during mint', async () => {
      let resolveMint: () => void = () => {}
      mockMintToken.mockReturnValue(
        new Promise((resolve) => {
          resolveMint = () => resolve({ success: true, data: [] })
        })
      )

      const { executeMint, isMinting } = useMintToken()

      expect(isMinting.value).toBe(false)

      const mintPromise = executeMint(mockToken, '100')

      // Check isMinting is true during mint
      expect(isMinting.value).toBe(true)

      resolveMint()
      await mintPromise

      // Check isMinting is false after mint
      expect(isMinting.value).toBe(false)
    })

    it('should reset isMinting on error', async () => {
      mockMintToken.mockRejectedValue(new Error('Mint failed'))

      const { executeMint, isMinting } = useMintToken()

      await executeMint(mockToken, '100')

      expect(isMinting.value).toBe(false)
    })
  })

  describe('clearError', () => {
    it('should clear mintError', async () => {
      mockMintToken.mockResolvedValue({ success: false, error: 'Test error' })

      const { executeMint, mintError, clearError } = useMintToken()

      await executeMint(mockToken, '100')

      expect(mintError.value).toBe('Test error')

      clearError()

      expect(mintError.value).toBe(null)
    })

    it('should clear error before new mint attempt', async () => {
      mockMintToken.mockResolvedValue({ success: false, error: 'Test error' })

      const { executeMint, mintError } = useMintToken()

      await executeMint(mockToken, '100')
      expect(mintError.value).toBe('Test error')

      // Second attempt clears error first
      mockMintToken.mockResolvedValue({ success: true, data: [] })
      const result = await executeMint(mockToken, '100')

      expect(result.success).toBe(true)
    })
  })

  describe('computed properties', () => {
    it('should return connected status', () => {
      const { isConnected } = useMintToken()
      expect(isConnected.value).toBe(true)
    })

    it('should return ownerAddress', () => {
      const { ownerAddress } = useMintToken()
      expect(ownerAddress.value).toBe('client|owner12345678901234567890')
    })

    it('should combine loading states', async () => {
      let resolveMint: () => void = () => {}
      mockMintToken.mockReturnValue(
        new Promise((resolve) => {
          resolveMint = () => resolve({ success: true, data: [] })
        })
      )

      const { executeMint, isLoading } = useMintToken()

      expect(isLoading.value).toBe(false)

      const mintPromise = executeMint(mockToken, '100')
      expect(isLoading.value).toBe(true)

      resolveMint()
      await mintPromise

      expect(isLoading.value).toBe(false)
    })
  })
})
