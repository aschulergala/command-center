/**
 * Tests for useTokenAuthority composable
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { AllowanceType } from '@gala-chain/api'
import { useTokenAuthority } from '@/composables/useTokenAuthority'
import { useTokensStore } from '@/stores/tokens'
import type { FungibleTokenDisplay, AllowanceDisplay } from '@shared/types/display'

// Mock wallet store
vi.mock('@/stores/wallet', () => ({
  useWalletStore: () => ({
    connected: true,
    address: 'client|user123456789012345678901234567890',
  }),
}))

describe('useTokenAuthority', () => {
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

  const mockTokenNoAuthority: FungibleTokenDisplay = {
    ...mockToken,
    tokenKey: 'OTHER|Unit|TOKEN|',
    collection: 'OTHER',
    type: 'TOKEN',
    canMint: false,
    canBurn: false,
    mintAllowanceRaw: undefined,
    mintAllowanceFormatted: undefined,
  }

  const mockMintAllowance: AllowanceDisplay = {
    allowanceKey: 'GALA|Unit|GALA||mint',
    collection: 'GALA',
    category: 'Unit',
    type: 'GALA',
    additionalKey: '',
    instance: '0',
    allowanceType: AllowanceType.Mint,
    grantedBy: 'client|admin12345678901234567890',
    grantedTo: 'client|user123456789012345678901234567890',
    quantityRaw: '100000000000',
    quantitySpentRaw: '50000000000',
    quantityRemainingRaw: '50000000000',
    quantityRemainingFormatted: '500',
    usesRaw: '0',
    usesSpentRaw: '0',
    expires: 0,
    isExpired: false,
    expiresFormatted: 'Never',
  }

  const mockBurnAllowance: AllowanceDisplay = {
    ...mockMintAllowance,
    allowanceKey: 'GALA|Unit|GALA||burn',
    allowanceType: AllowanceType.Burn,
    quantityRaw: '200000000000',
    quantitySpentRaw: '0',
    quantityRemainingRaw: '200000000000',
    quantityRemainingFormatted: '2,000',
  }

  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  describe('hasMintAuthority', () => {
    it('should return true when token has canMint flag', () => {
      const { hasMintAuthority } = useTokenAuthority()
      expect(hasMintAuthority(mockToken)).toBe(true)
    })

    it('should return false when token does not have canMint flag', () => {
      const { hasMintAuthority } = useTokenAuthority()
      expect(hasMintAuthority(mockTokenNoAuthority)).toBe(false)
    })
  })

  describe('hasBurnAuthority', () => {
    it('should return true when token has canBurn flag', () => {
      const { hasBurnAuthority } = useTokenAuthority()
      const tokenWithBurn = { ...mockToken, canBurn: true }
      expect(hasBurnAuthority(tokenWithBurn)).toBe(true)
    })

    it('should return false when token does not have canBurn flag', () => {
      const { hasBurnAuthority } = useTokenAuthority()
      expect(hasBurnAuthority(mockToken)).toBe(false)
    })
  })

  describe('getMintAllowance', () => {
    it('should return mint allowance when found in store', () => {
      const store = useTokensStore()
      store.$patch({
        allowances: [mockMintAllowance],
      })

      const { getMintAllowance } = useTokenAuthority()
      const allowance = getMintAllowance(mockToken)

      expect(allowance).toEqual(mockMintAllowance)
    })

    it('should return null when no mint allowance exists', () => {
      const store = useTokensStore()
      store.$patch({
        allowances: [mockBurnAllowance], // Only burn, no mint
      })

      const { getMintAllowance } = useTokenAuthority()
      const allowance = getMintAllowance(mockToken)

      expect(allowance).toBeNull()
    })

    it('should return null for different token', () => {
      const store = useTokensStore()
      store.$patch({
        allowances: [mockMintAllowance],
      })

      const { getMintAllowance } = useTokenAuthority()
      const allowance = getMintAllowance(mockTokenNoAuthority)

      expect(allowance).toBeNull()
    })

    it('should filter out expired allowances', () => {
      const store = useTokensStore()
      store.$patch({
        allowances: [{ ...mockMintAllowance, isExpired: true }],
      })

      const { getMintAllowance } = useTokenAuthority()
      const allowance = getMintAllowance(mockToken)

      expect(allowance).toBeNull()
    })
  })

  describe('getBurnAllowance', () => {
    it('should return burn allowance when found in store', () => {
      const store = useTokensStore()
      store.$patch({
        allowances: [mockBurnAllowance],
      })

      const { getBurnAllowance } = useTokenAuthority()
      const allowance = getBurnAllowance(mockToken)

      expect(allowance).toEqual(mockBurnAllowance)
    })

    it('should return null when no burn allowance exists', () => {
      const store = useTokensStore()
      store.$patch({
        allowances: [mockMintAllowance], // Only mint, no burn
      })

      const { getBurnAllowance } = useTokenAuthority()
      const allowance = getBurnAllowance(mockToken)

      expect(allowance).toBeNull()
    })
  })

  describe('getMintAllowanceRemaining', () => {
    it('should return remaining mint allowance as BigNumber', () => {
      const store = useTokensStore()
      store.$patch({
        allowances: [mockMintAllowance],
      })

      const { getMintAllowanceRemaining } = useTokenAuthority()
      const remaining = getMintAllowanceRemaining(mockToken)

      expect(remaining).not.toBeNull()
      expect(remaining!.toString()).toBe('50000000000')
    })

    it('should return null when no allowance exists', () => {
      const store = useTokensStore()
      store.$patch({
        allowances: [],
      })

      const { getMintAllowanceRemaining } = useTokenAuthority()
      const remaining = getMintAllowanceRemaining(mockToken)

      expect(remaining).toBeNull()
    })

    it('should return null when remaining allowance is zero or negative', () => {
      const store = useTokensStore()
      store.$patch({
        allowances: [{
          ...mockMintAllowance,
          quantityRemainingRaw: '0',
        }],
      })

      const { getMintAllowanceRemaining } = useTokenAuthority()
      const remaining = getMintAllowanceRemaining(mockToken)

      expect(remaining).toBeNull()
    })
  })

  describe('getTokenAuthority', () => {
    it('should return comprehensive authority info', () => {
      const store = useTokensStore()
      store.$patch({
        allowances: [mockMintAllowance, mockBurnAllowance],
      })

      const tokenWithBurn = { ...mockToken, canBurn: true }
      const { getTokenAuthority } = useTokenAuthority()
      const authority = getTokenAuthority(tokenWithBurn)

      expect(authority.canMint).toBe(true)
      expect(authority.canBurn).toBe(true)
      expect(authority.mintAllowanceRemaining).not.toBeNull()
      expect(authority.mintAllowance).toEqual(mockMintAllowance)
      expect(authority.burnAllowance).toEqual(mockBurnAllowance)
    })
  })

  describe('isValidMintAmount', () => {
    it('should return true for valid amount within allowance', () => {
      const store = useTokensStore()
      store.$patch({
        allowances: [mockMintAllowance],
      })

      const { isValidMintAmount } = useTokenAuthority()
      expect(isValidMintAmount(mockToken, '10000000000')).toBe(true)
    })

    it('should return true for amount equal to allowance', () => {
      const store = useTokensStore()
      store.$patch({
        allowances: [mockMintAllowance],
      })

      const { isValidMintAmount } = useTokenAuthority()
      expect(isValidMintAmount(mockToken, '50000000000')).toBe(true)
    })

    it('should return false for amount exceeding allowance', () => {
      const store = useTokensStore()
      store.$patch({
        allowances: [mockMintAllowance],
      })

      const { isValidMintAmount } = useTokenAuthority()
      expect(isValidMintAmount(mockToken, '60000000000')).toBe(false)
    })

    it('should return false for zero amount', () => {
      const store = useTokensStore()
      store.$patch({
        allowances: [mockMintAllowance],
      })

      const { isValidMintAmount } = useTokenAuthority()
      expect(isValidMintAmount(mockToken, '0')).toBe(false)
    })

    it('should return false for negative amount', () => {
      const store = useTokensStore()
      store.$patch({
        allowances: [mockMintAllowance],
      })

      const { isValidMintAmount } = useTokenAuthority()
      expect(isValidMintAmount(mockToken, '-100')).toBe(false)
    })

    it('should return false for invalid number', () => {
      const store = useTokensStore()
      store.$patch({
        allowances: [mockMintAllowance],
      })

      const { isValidMintAmount } = useTokenAuthority()
      expect(isValidMintAmount(mockToken, 'invalid')).toBe(false)
    })

    it('should return false when no mint allowance exists', () => {
      const store = useTokensStore()
      store.$patch({
        allowances: [],
      })

      const { isValidMintAmount } = useTokenAuthority()
      expect(isValidMintAmount(mockToken, '100')).toBe(false)
    })
  })

  describe('isValidBurnAmount', () => {
    it('should return true for valid amount within balance', () => {
      const { isValidBurnAmount } = useTokenAuthority()
      expect(isValidBurnAmount(mockToken, '50000000000')).toBe(true)
    })

    it('should return true for amount equal to balance', () => {
      const { isValidBurnAmount } = useTokenAuthority()
      expect(isValidBurnAmount(mockToken, '100000000000')).toBe(true)
    })

    it('should return false for amount exceeding balance', () => {
      const { isValidBurnAmount } = useTokenAuthority()
      expect(isValidBurnAmount(mockToken, '200000000000')).toBe(false)
    })

    it('should return false for zero amount', () => {
      const { isValidBurnAmount } = useTokenAuthority()
      expect(isValidBurnAmount(mockToken, '0')).toBe(false)
    })

    it('should return false for negative amount', () => {
      const { isValidBurnAmount } = useTokenAuthority()
      expect(isValidBurnAmount(mockToken, '-100')).toBe(false)
    })

    it('should return false for invalid number', () => {
      const { isValidBurnAmount } = useTokenAuthority()
      expect(isValidBurnAmount(mockToken, 'invalid')).toBe(false)
    })
  })

  describe('computed lists', () => {
    it('should return mintableTokens from store', () => {
      const store = useTokensStore()
      store.$patch({
        tokens: [mockToken, mockTokenNoAuthority],
      })

      const { mintableTokens } = useTokenAuthority()
      expect(mintableTokens.value).toHaveLength(1)
      expect(mintableTokens.value[0].tokenKey).toBe(mockToken.tokenKey)
    })

    it('should return burnableTokens from store', () => {
      const tokenWithBurn = { ...mockToken, canBurn: true }
      const store = useTokensStore()
      store.$patch({
        tokens: [tokenWithBurn, mockTokenNoAuthority],
      })

      const { burnableTokens } = useTokenAuthority()
      expect(burnableTokens.value).toHaveLength(1)
      expect(burnableTokens.value[0].tokenKey).toBe(mockToken.tokenKey)
    })

    it('should return mintAllowances excluding expired', () => {
      const expiredAllowance = { ...mockMintAllowance, isExpired: true }
      const store = useTokensStore()
      store.$patch({
        allowances: [mockMintAllowance, expiredAllowance],
      })

      const { mintAllowances } = useTokenAuthority()
      expect(mintAllowances.value).toHaveLength(1)
    })

    it('should return burnAllowances excluding expired', () => {
      const expiredAllowance = { ...mockBurnAllowance, isExpired: true }
      const store = useTokensStore()
      store.$patch({
        allowances: [mockBurnAllowance, expiredAllowance],
      })

      const { burnAllowances } = useTokenAuthority()
      expect(burnAllowances.value).toHaveLength(1)
    })
  })
})
