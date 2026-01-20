/**
 * Tests for useBurnToken composable
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useBurnToken } from '@/composables/useBurnToken'
import { useWalletStore } from '@/stores/wallet'
import type { FungibleTokenDisplay } from '@shared/types/display'

// Mock useGalaChain composable
const mockBurnTokens = vi.fn()
vi.mock('@/composables/useGalaChain', () => ({
  useGalaChain: () => ({
    burnTokens: mockBurnTokens,
    isLoading: { value: false },
    error: { value: null },
  }),
}))

// Create mock token
function createMockToken(overrides: Partial<FungibleTokenDisplay> = {}): FungibleTokenDisplay {
  return {
    tokenKey: 'TEST|TestCategory|TestType|',
    collection: 'TEST',
    category: 'TestCategory',
    type: 'TestType',
    additionalKey: '',
    name: 'Test Token',
    symbol: 'TST',
    decimals: 8,
    balanceRaw: '100000000000',
    balanceFormatted: '1,000',
    spendableBalanceRaw: '100000000000',
    spendableBalanceFormatted: '1,000',
    lockedBalanceRaw: '0',
    lockedBalanceFormatted: '0',
    canMint: false,
    canBurn: true,
    image: undefined,
    ...overrides,
  }
}

describe('useBurnToken', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('initial state', () => {
    it('has isBurning as false', () => {
      const { isBurning } = useBurnToken()
      expect(isBurning.value).toBe(false)
    })

    it('has error as null', () => {
      const { burnError } = useBurnToken()
      expect(burnError.value).toBeNull()
    })

    it('reflects wallet connection status', () => {
      const { isConnected } = useBurnToken()
      expect(isConnected.value).toBe(false)
    })

    it('has empty owner address when not connected', () => {
      const { ownerAddress } = useBurnToken()
      expect(ownerAddress.value).toBe('')
    })
  })

  describe('buildTokenInstanceKey', () => {
    it('builds correct token instance key from token', () => {
      const { buildTokenInstanceKey } = useBurnToken()
      const token = createMockToken()

      const key = buildTokenInstanceKey(token)

      expect(key).toEqual({
        collection: 'TEST',
        category: 'TestCategory',
        type: 'TestType',
        additionalKey: '',
        instance: '0',
      })
    })

    it('handles token with additionalKey', () => {
      const { buildTokenInstanceKey } = useBurnToken()
      const token = createMockToken({ additionalKey: 'extra' })

      const key = buildTokenInstanceKey(token)

      expect(key.additionalKey).toBe('extra')
    })
  })

  describe('executeBurn', () => {
    it('returns error when wallet not connected', async () => {
      const { executeBurn } = useBurnToken()
      const token = createMockToken()

      const result = await executeBurn(token, '1000')

      expect(result.success).toBe(false)
      expect(result.error).toContain('Wallet not connected')
    })

    it('calls burnTokens with correct parameters when connected', async () => {
      // Setup wallet store
      const walletStore = useWalletStore()
      walletStore.$patch({
        connected: true,
        address: 'client|testaddress123',
      })

      mockBurnTokens.mockResolvedValue({ success: true })

      const { executeBurn } = useBurnToken()
      const token = createMockToken()

      await executeBurn(token, '1000')

      // burnTokens expects an array of { tokenInstanceKey, quantity }
      expect(mockBurnTokens).toHaveBeenCalledWith([
        {
          tokenInstanceKey: expect.objectContaining({
            collection: 'TEST',
            category: 'TestCategory',
            type: 'TestType',
            additionalKey: '',
            instance: '0',
          }),
          quantity: '1000',
        },
      ])
    })

    it('returns success result on successful burn', async () => {
      const walletStore = useWalletStore()
      walletStore.$patch({
        connected: true,
        address: 'client|testaddress123',
      })

      mockBurnTokens.mockResolvedValue({ success: true })

      const { executeBurn } = useBurnToken()
      const token = createMockToken()

      const result = await executeBurn(token, '1000')

      expect(result.success).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('returns error result on failed burn', async () => {
      const walletStore = useWalletStore()
      walletStore.$patch({
        connected: true,
        address: 'client|testaddress123',
      })

      mockBurnTokens.mockResolvedValue({
        success: false,
        error: 'Insufficient balance',
      })

      const { executeBurn } = useBurnToken()
      const token = createMockToken()

      const result = await executeBurn(token, '1000')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Insufficient balance')
    })

    it('sets isBurning to true during burn', async () => {
      const walletStore = useWalletStore()
      walletStore.$patch({
        connected: true,
        address: 'client|testaddress123',
      })

      let resolveBurn: (value: { success: boolean }) => void
      mockBurnTokens.mockImplementation(() => new Promise((resolve) => {
        resolveBurn = resolve
      }))

      const { executeBurn, isBurning } = useBurnToken()
      const token = createMockToken()

      const burnPromise = executeBurn(token, '1000')

      expect(isBurning.value).toBe(true)

      resolveBurn!({ success: true })
      await burnPromise

      expect(isBurning.value).toBe(false)
    })

    it('handles thrown errors', async () => {
      const walletStore = useWalletStore()
      walletStore.$patch({
        connected: true,
        address: 'client|testaddress123',
      })

      mockBurnTokens.mockRejectedValue(new Error('Network error'))

      const { executeBurn } = useBurnToken()
      const token = createMockToken()

      const result = await executeBurn(token, '1000')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Network error')
    })
  })

  describe('clearError', () => {
    it('clears the burn error', async () => {
      const walletStore = useWalletStore()
      walletStore.$patch({
        connected: true,
        address: 'client|testaddress123',
      })

      mockBurnTokens.mockResolvedValue({
        success: false,
        error: 'Some error',
      })

      const { executeBurn, burnError, clearError } = useBurnToken()
      const token = createMockToken()

      await executeBurn(token, '1000')
      expect(burnError.value).toBe('Some error')

      clearError()
      expect(burnError.value).toBeNull()
    })
  })
})
