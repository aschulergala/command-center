import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useTokensStore } from '@/stores/tokens'
import { AllowanceType } from '@gala-chain/api'
import BigNumber from 'bignumber.js'

describe('tokens store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('canBurn logic', () => {
    it('sets canBurn to true when user has positive balance (no burn allowance)', () => {
      const store = useTokensStore()

      // Token balance with positive quantity but no burn allowance
      const balances = [
        {
          collection: 'GALA',
          category: 'Unit',
          type: 'GALA',
          additionalKey: '',
          quantity: new BigNumber('100'),
          instanceIds: [],
        },
      ]

      store.setBalances(balances as any)
      store.setAllowances([], AllowanceType.Mint, AllowanceType.Burn)

      expect(store.tokens).toHaveLength(1)
      expect(store.tokens[0].canBurn).toBe(true)
    })

    it('sets canBurn to true when user has burn allowance (no balance)', () => {
      const store = useTokensStore()

      // Token balance with zero quantity but has burn allowance
      const balances = [
        {
          collection: 'GALA',
          category: 'Unit',
          type: 'GALA',
          additionalKey: '',
          quantity: new BigNumber('0'),
          instanceIds: [],
        },
      ]

      const burnAllowances = [
        {
          collection: 'GALA',
          category: 'Unit',
          type: 'GALA',
          additionalKey: '',
          allowanceType: AllowanceType.Burn,
          grantedBy: 'client|authority',
          grantedTo: 'client|user',
          quantity: new BigNumber('1000'),
          quantitySpent: new BigNumber('0'),
          uses: new BigNumber('0'),
          usesSpent: new BigNumber('0'),
          instance: new BigNumber('0'),
        },
      ]

      store.setBalances(balances as any)
      store.setAllowances(burnAllowances as any, AllowanceType.Mint, AllowanceType.Burn)

      expect(store.tokens).toHaveLength(1)
      expect(store.tokens[0].canBurn).toBe(true)
    })

    it('sets canBurn to true when user has both balance and burn allowance', () => {
      const store = useTokensStore()

      const balances = [
        {
          collection: 'GALA',
          category: 'Unit',
          type: 'GALA',
          additionalKey: '',
          quantity: new BigNumber('100'),
          instanceIds: [],
        },
      ]

      const burnAllowances = [
        {
          collection: 'GALA',
          category: 'Unit',
          type: 'GALA',
          additionalKey: '',
          allowanceType: AllowanceType.Burn,
          grantedBy: 'client|authority',
          grantedTo: 'client|user',
          quantity: new BigNumber('1000'),
          quantitySpent: new BigNumber('0'),
          uses: new BigNumber('0'),
          usesSpent: new BigNumber('0'),
          instance: new BigNumber('0'),
        },
      ]

      store.setBalances(balances as any)
      store.setAllowances(burnAllowances as any, AllowanceType.Mint, AllowanceType.Burn)

      expect(store.tokens).toHaveLength(1)
      expect(store.tokens[0].canBurn).toBe(true)
    })

    it('sets canBurn to false when user has zero balance and no burn allowance', () => {
      const store = useTokensStore()

      // Token balance with zero quantity and no burn allowance
      const balances = [
        {
          collection: 'GALA',
          category: 'Unit',
          type: 'GALA',
          additionalKey: '',
          quantity: new BigNumber('0'),
          instanceIds: [],
        },
      ]

      store.setBalances(balances as any)
      store.setAllowances([], AllowanceType.Mint, AllowanceType.Burn)

      expect(store.tokens).toHaveLength(1)
      expect(store.tokens[0].canBurn).toBe(false)
    })

    it('sets canMint based only on mint allowance (not balance)', () => {
      const store = useTokensStore()

      // Positive balance but no mint allowance - should NOT be able to mint
      const balances = [
        {
          collection: 'GALA',
          category: 'Unit',
          type: 'GALA',
          additionalKey: '',
          quantity: new BigNumber('100'),
          instanceIds: [],
        },
      ]

      store.setBalances(balances as any)
      store.setAllowances([], AllowanceType.Mint, AllowanceType.Burn)

      expect(store.tokens).toHaveLength(1)
      expect(store.tokens[0].canMint).toBe(false)
    })

    it('handles multiple tokens with different burn capabilities', () => {
      const store = useTokensStore()

      const balances = [
        {
          collection: 'GALA',
          category: 'Unit',
          type: 'GALA',
          additionalKey: '',
          quantity: new BigNumber('100'), // Has balance - can burn
          instanceIds: [],
        },
        {
          collection: 'SILK',
          category: 'Unit',
          type: 'SILK',
          additionalKey: '',
          quantity: new BigNumber('0'), // No balance, no allowance - cannot burn
          instanceIds: [],
        },
        {
          collection: 'Token',
          category: 'Unit',
          type: 'Custom',
          additionalKey: '',
          quantity: new BigNumber('0'), // No balance but has allowance - can burn
          instanceIds: [],
        },
      ]

      const burnAllowances = [
        {
          collection: 'Token',
          category: 'Unit',
          type: 'Custom',
          additionalKey: '',
          allowanceType: AllowanceType.Burn,
          grantedBy: 'client|authority',
          grantedTo: 'client|user',
          quantity: new BigNumber('1000'),
          quantitySpent: new BigNumber('0'),
          uses: new BigNumber('0'),
          usesSpent: new BigNumber('0'),
          instance: new BigNumber('0'),
        },
      ]

      store.setBalances(balances as any)
      store.setAllowances(burnAllowances as any, AllowanceType.Mint, AllowanceType.Burn)

      expect(store.tokens).toHaveLength(3)

      const galaToken = store.tokens.find(t => t.collection === 'GALA')
      const silkToken = store.tokens.find(t => t.collection === 'SILK')
      const customToken = store.tokens.find(t => t.type === 'Custom')

      expect(galaToken?.canBurn).toBe(true) // Has balance
      expect(silkToken?.canBurn).toBe(false) // No balance, no allowance
      expect(customToken?.canBurn).toBe(true) // Has burn allowance
    })
  })

  describe('burnableTokens getter', () => {
    it('returns tokens that can be burned', () => {
      const store = useTokensStore()

      const balances = [
        {
          collection: 'GALA',
          category: 'Unit',
          type: 'GALA',
          additionalKey: '',
          quantity: new BigNumber('100'),
          instanceIds: [],
        },
        {
          collection: 'SILK',
          category: 'Unit',
          type: 'SILK',
          additionalKey: '',
          quantity: new BigNumber('0'),
          instanceIds: [],
        },
      ]

      store.setBalances(balances as any)
      store.setAllowances([], AllowanceType.Mint, AllowanceType.Burn)

      expect(store.burnableTokens).toHaveLength(1)
      expect(store.burnableTokens[0].collection).toBe('GALA')
    })
  })
})
