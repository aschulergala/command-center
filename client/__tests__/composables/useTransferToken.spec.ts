/**
 * Tests for useTransferToken composable
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useTransferToken } from '@/composables/useTransferToken'
import type { FungibleTokenDisplay } from '@shared/types/display'

// Mock useGalaChain
const mockTransferToken = vi.fn()

vi.mock('@/composables/useGalaChain', () => ({
  useGalaChain: () => ({
    transferToken: mockTransferToken,
    isLoading: { value: false },
    error: { value: null },
  }),
}))

// Mock wallet store
vi.mock('@/stores/wallet', () => ({
  useWalletStore: () => ({
    connected: true,
    address: 'client|sender12345678901234567890',
    getClient: () => ({}),
  }),
}))

describe('useTransferToken', () => {
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
    balanceRaw: '1000',
    balanceFormatted: '1,000',
    lockedBalanceRaw: '0',
    lockedBalanceFormatted: '0',
    spendableBalanceRaw: '1000',
    spendableBalanceFormatted: '1,000',
    canMint: false,
    canBurn: false,
  }

  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    mockTransferToken.mockReset()
  })

  describe('buildTokenInstance', () => {
    it('should build correct token instance from FungibleTokenDisplay', () => {
      const { buildTokenInstance } = useTransferToken()
      const result = buildTokenInstance(mockToken)

      expect(result).toEqual({
        collection: 'GALA',
        category: 'Unit',
        type: 'GALA',
        additionalKey: '',
        instance: '0',
      })
    })

    it('should always set instance to 0 for fungible tokens', () => {
      const { buildTokenInstance } = useTransferToken()
      const tokenWithKey = { ...mockToken, additionalKey: 'somekey' }
      const result = buildTokenInstance(tokenWithKey)

      expect(result.instance).toBe('0')
    })
  })

  describe('executeTransfer', () => {
    it('should call transferToken with correct parameters on success', async () => {
      mockTransferToken.mockResolvedValue({ success: true, data: [] })

      const { executeTransfer } = useTransferToken()
      const recipient = 'client|recipient123456789012345678901234567890'
      const amount = '100'

      const result = await executeTransfer(mockToken, recipient, amount)

      expect(mockTransferToken).toHaveBeenCalledWith(
        recipient,
        {
          collection: 'GALA',
          category: 'Unit',
          type: 'GALA',
          additionalKey: '',
          instance: '0',
        },
        amount
      )
      expect(result.success).toBe(true)
    })

    it('should return success result on successful transfer', async () => {
      mockTransferToken.mockResolvedValue({ success: true, data: [] })

      const { executeTransfer } = useTransferToken()
      const result = await executeTransfer(
        mockToken,
        'client|recipient123456789012345678901234567890',
        '100'
      )

      expect(result).toEqual({ success: true })
    })

    it('should return error result on failed transfer', async () => {
      mockTransferToken.mockResolvedValue({ success: false, error: 'Insufficient balance' })

      const { executeTransfer } = useTransferToken()
      const result = await executeTransfer(
        mockToken,
        'client|recipient123456789012345678901234567890',
        '100'
      )

      expect(result).toEqual({ success: false, error: 'Insufficient balance' })
    })

    it('should handle thrown errors', async () => {
      mockTransferToken.mockRejectedValue(new Error('Network error'))

      const { executeTransfer } = useTransferToken()
      const result = await executeTransfer(
        mockToken,
        'client|recipient123456789012345678901234567890',
        '100'
      )

      expect(result.success).toBe(false)
      expect(result.error).toBe('Network error')
    })

    it('should update isTransferring state during transfer', async () => {
      let resolveTransfer: () => void = () => {}
      mockTransferToken.mockReturnValue(
        new Promise((resolve) => {
          resolveTransfer = () => resolve({ success: true, data: [] })
        })
      )

      const { executeTransfer, isTransferring } = useTransferToken()

      expect(isTransferring.value).toBe(false)

      const transferPromise = executeTransfer(
        mockToken,
        'client|recipient123456789012345678901234567890',
        '100'
      )

      // Check isTransferring is true during transfer
      expect(isTransferring.value).toBe(true)

      resolveTransfer()
      await transferPromise

      // Check isTransferring is false after transfer
      expect(isTransferring.value).toBe(false)
    })
  })

  describe('clearError', () => {
    it('should clear transferError', async () => {
      mockTransferToken.mockResolvedValue({ success: false, error: 'Test error' })

      const { executeTransfer, transferError, clearError } = useTransferToken()

      await executeTransfer(
        mockToken,
        'client|recipient123456789012345678901234567890',
        '100'
      )

      expect(transferError.value).toBe('Test error')

      clearError()

      expect(transferError.value).toBe(null)
    })
  })

  describe('computed properties', () => {
    it('should return connected status', () => {
      const { isConnected } = useTransferToken()
      expect(isConnected.value).toBe(true)
    })

    it('should return fromAddress', () => {
      const { fromAddress } = useTransferToken()
      expect(fromAddress.value).toBe('client|sender12345678901234567890')
    })
  })
})
