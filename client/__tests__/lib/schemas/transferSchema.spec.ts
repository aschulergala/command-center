/**
 * Tests for transfer validation schema
 */

import { describe, it, expect } from 'vitest'
import {
  isValidGalaChainAddress,
  isValidAmount,
  isWithinBalance,
  createTransferSchema,
  formatAmount,
} from '@/lib/schemas/transferSchema'

describe('transferSchema', () => {
  describe('isValidGalaChainAddress', () => {
    it('should accept valid client| prefixed addresses', () => {
      expect(isValidGalaChainAddress('client|abc123def456789012345678901234567890')).toBe(true)
      expect(isValidGalaChainAddress('client|ABCDEF123456789012345678901234567890')).toBe(true)
    })

    it('should accept valid eth| prefixed addresses', () => {
      expect(isValidGalaChainAddress('eth|abc123def456789012345678901234567890')).toBe(true)
      expect(isValidGalaChainAddress('eth|ABCDEF123456789012345678901234567890')).toBe(true)
    })

    it('should accept valid 0x prefixed Ethereum addresses', () => {
      expect(isValidGalaChainAddress('0x742d35Cc6634C0532925a3b844Bc9e7595f1b923')).toBe(true)
      expect(isValidGalaChainAddress('0xABCDEF1234567890abcdef1234567890ABCDEF12')).toBe(true)
    })

    it('should reject addresses without valid prefix', () => {
      expect(isValidGalaChainAddress('abc123def456789012345678901234567890')).toBe(false)
      expect(isValidGalaChainAddress('invalid|abc123')).toBe(false)
    })

    it('should reject short addresses', () => {
      expect(isValidGalaChainAddress('client|abc')).toBe(false)
      expect(isValidGalaChainAddress('eth|12345')).toBe(false)
      expect(isValidGalaChainAddress('0x1234567890')).toBe(false)
    })

    it('should reject empty and null values', () => {
      expect(isValidGalaChainAddress('')).toBe(false)
      expect(isValidGalaChainAddress(null as unknown as string)).toBe(false)
      expect(isValidGalaChainAddress(undefined as unknown as string)).toBe(false)
    })

    it('should reject addresses with special characters', () => {
      expect(isValidGalaChainAddress('client|abc!@#$%^&*()')).toBe(false)
      expect(isValidGalaChainAddress('client|abc def')).toBe(false)
    })

    it('should reject malformed pipe addresses', () => {
      expect(isValidGalaChainAddress('client|')).toBe(false)
      expect(isValidGalaChainAddress('|abc123')).toBe(false)
      expect(isValidGalaChainAddress('client|abc|def')).toBe(false)
    })
  })

  describe('isValidAmount', () => {
    it('should accept valid positive amounts', () => {
      expect(isValidAmount('100')).toBe(true)
      expect(isValidAmount('0.001')).toBe(true)
      expect(isValidAmount('1234567890.123456789')).toBe(true)
      expect(isValidAmount('999999999999')).toBe(true)
    })

    it('should accept amounts with leading/trailing whitespace', () => {
      expect(isValidAmount('  100  ')).toBe(true)
      expect(isValidAmount(' 0.5 ')).toBe(true)
    })

    it('should reject zero', () => {
      expect(isValidAmount('0')).toBe(false)
      expect(isValidAmount('0.0')).toBe(false)
      expect(isValidAmount('0.000')).toBe(false)
    })

    it('should reject negative amounts', () => {
      expect(isValidAmount('-100')).toBe(false)
      expect(isValidAmount('-0.001')).toBe(false)
    })

    it('should reject non-numeric strings', () => {
      expect(isValidAmount('abc')).toBe(false)
      expect(isValidAmount('10abc')).toBe(false)
      expect(isValidAmount('$100')).toBe(false)
    })

    it('should reject empty and malformed values', () => {
      expect(isValidAmount('')).toBe(false)
      expect(isValidAmount('.')).toBe(false)
      expect(isValidAmount('-')).toBe(false)
      expect(isValidAmount(null as unknown as string)).toBe(false)
      expect(isValidAmount(undefined as unknown as string)).toBe(false)
    })
  })

  describe('isWithinBalance', () => {
    it('should return true when amount equals balance', () => {
      expect(isWithinBalance('100', '100')).toBe(true)
      expect(isWithinBalance('0.5', '0.5')).toBe(true)
    })

    it('should return true when amount is less than balance', () => {
      expect(isWithinBalance('50', '100')).toBe(true)
      expect(isWithinBalance('0.001', '0.5')).toBe(true)
    })

    it('should return false when amount exceeds balance', () => {
      expect(isWithinBalance('150', '100')).toBe(false)
      expect(isWithinBalance('1', '0.5')).toBe(false)
    })

    it('should return false for invalid amounts', () => {
      expect(isWithinBalance('', '100')).toBe(false)
      expect(isWithinBalance('abc', '100')).toBe(false)
      expect(isWithinBalance('-10', '100')).toBe(false)
    })

    it('should handle decimal precision correctly', () => {
      expect(isWithinBalance('0.123456789', '0.123456789')).toBe(true)
      expect(isWithinBalance('0.1234567891', '0.123456789')).toBe(false)
    })
  })

  describe('createTransferSchema', () => {
    const maxBalance = '1000'
    // Use a valid GalaChain address format (hex chars only after prefix)
    const fromAddress = 'client|aabbccdd1234567890abcdef1234567890'
    const schema = createTransferSchema(maxBalance, fromAddress)

    describe('recipientAddress validation', () => {
      it('should accept valid recipient addresses', () => {
        const result = schema.safeParse({
          recipientAddress: 'client|abc123def456789012345678901234567890',
          amount: '100',
        })
        expect(result.success).toBe(true)
      })

      it('should reject empty recipient address', () => {
        const result = schema.safeParse({
          recipientAddress: '',
          amount: '100',
        })
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toContain('required')
        }
      })

      it('should reject invalid address format', () => {
        const result = schema.safeParse({
          recipientAddress: 'invalid-address',
          amount: '100',
        })
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toContain('valid GalaChain address')
        }
      })

      it('should reject sending to self', () => {
        const result = schema.safeParse({
          recipientAddress: fromAddress,
          amount: '100',
        })
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toContain('yourself')
        }
      })

      it('should reject sending to self (case insensitive)', () => {
        const result = schema.safeParse({
          recipientAddress: fromAddress.toUpperCase(),
          amount: '100',
        })
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toContain('yourself')
        }
      })
    })

    describe('amount validation', () => {
      it('should accept valid amounts within balance', () => {
        const result = schema.safeParse({
          recipientAddress: 'client|abc123def456789012345678901234567890',
          amount: '100',
        })
        expect(result.success).toBe(true)
      })

      it('should accept amount equal to max balance', () => {
        const result = schema.safeParse({
          recipientAddress: 'client|abc123def456789012345678901234567890',
          amount: '1000',
        })
        expect(result.success).toBe(true)
      })

      it('should reject empty amount', () => {
        const result = schema.safeParse({
          recipientAddress: 'client|abc123def456789012345678901234567890',
          amount: '',
        })
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toContain('required')
        }
      })

      it('should reject amount exceeding balance', () => {
        const result = schema.safeParse({
          recipientAddress: 'client|abc123def456789012345678901234567890',
          amount: '1001',
        })
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toContain('exceeds')
        }
      })

      it('should reject negative amounts', () => {
        const result = schema.safeParse({
          recipientAddress: 'client|abc123def456789012345678901234567890',
          amount: '-100',
        })
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toContain('valid positive amount')
        }
      })

      it('should reject zero amount', () => {
        const result = schema.safeParse({
          recipientAddress: 'client|abc123def456789012345678901234567890',
          amount: '0',
        })
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toContain('valid positive amount')
        }
      })
    })
  })

  describe('formatAmount', () => {
    it('should format whole numbers', () => {
      expect(formatAmount('1000')).toBe('1,000')
      expect(formatAmount('1000000')).toBe('1,000,000')
    })

    it('should format decimal numbers', () => {
      expect(formatAmount('1000.5')).toBe('1,000.5')
      expect(formatAmount('0.123456789', 8)).toBe('0.12345679')
    })

    it('should handle empty and invalid values', () => {
      expect(formatAmount('')).toBe('0')
      expect(formatAmount('abc')).toBe('0')
    })

    it('should respect decimal precision', () => {
      expect(formatAmount('1.123456789', 4)).toBe('1.1235')
      expect(formatAmount('1.123456789', 2)).toBe('1.12')
    })
  })
})
