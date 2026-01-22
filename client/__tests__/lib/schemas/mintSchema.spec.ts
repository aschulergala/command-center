/**
 * Tests for mint schema validation
 */

import { describe, it, expect } from 'vitest'
import {
  isValidMintAmount,
  isWithinMintAllowance,
  createMintSchema,
  formatMintAmount,
} from '@/lib/schemas/mintSchema'

describe('mintSchema', () => {
  describe('isValidMintAmount', () => {
    it('should return true for valid positive numbers', () => {
      expect(isValidMintAmount('100')).toBe(true)
      expect(isValidMintAmount('0.001')).toBe(true)
      expect(isValidMintAmount('1000000000')).toBe(true)
    })

    it('should return false for zero', () => {
      expect(isValidMintAmount('0')).toBe(false)
      expect(isValidMintAmount('0.0')).toBe(false)
      expect(isValidMintAmount('0.00000')).toBe(false)
    })

    it('should return false for negative numbers', () => {
      expect(isValidMintAmount('-1')).toBe(false)
      expect(isValidMintAmount('-0.001')).toBe(false)
      expect(isValidMintAmount('-1000')).toBe(false)
    })

    it('should return false for empty or whitespace strings', () => {
      expect(isValidMintAmount('')).toBe(false)
      expect(isValidMintAmount('   ')).toBe(false)
    })

    it('should return false for invalid numbers', () => {
      expect(isValidMintAmount('abc')).toBe(false)
      expect(isValidMintAmount('12abc')).toBe(false)
      expect(isValidMintAmount('NaN')).toBe(false)
      expect(isValidMintAmount('Infinity')).toBe(false)
    })

    it('should handle scientific notation', () => {
      expect(isValidMintAmount('1e5')).toBe(true)
      expect(isValidMintAmount('1e-5')).toBe(true)
    })
  })

  describe('isWithinMintAllowance', () => {
    const allowance = '100000000000' // 1000 with 8 decimals

    it('should return true for amounts within allowance', () => {
      expect(isWithinMintAllowance('50000000000', allowance)).toBe(true)
      expect(isWithinMintAllowance('1', allowance)).toBe(true)
      expect(isWithinMintAllowance('99999999999', allowance)).toBe(true)
    })

    it('should return true for amount equal to allowance', () => {
      expect(isWithinMintAllowance('100000000000', allowance)).toBe(true)
    })

    it('should return false for amounts exceeding allowance', () => {
      expect(isWithinMintAllowance('100000000001', allowance)).toBe(false)
      expect(isWithinMintAllowance('200000000000', allowance)).toBe(false)
    })

    it('should return false for empty or invalid amounts', () => {
      expect(isWithinMintAllowance('', allowance)).toBe(false)
      expect(isWithinMintAllowance('abc', allowance)).toBe(false)
    })

    it('should handle zero allowance', () => {
      expect(isWithinMintAllowance('1', '0')).toBe(false)
    })
  })

  describe('createMintSchema', () => {
    const allowance = '100000000000'

    it('should validate valid mint amount', () => {
      const schema = createMintSchema(allowance)
      const result = schema.safeParse({ amount: '50000000000' })
      expect(result.success).toBe(true)
    })

    it('should validate amount equal to allowance', () => {
      const schema = createMintSchema(allowance)
      const result = schema.safeParse({ amount: '100000000000' })
      expect(result.success).toBe(true)
    })

    it('should reject empty amount', () => {
      const schema = createMintSchema(allowance)
      const result = schema.safeParse({ amount: '' })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Amount is required')
      }
    })

    it('should reject invalid amount', () => {
      const schema = createMintSchema(allowance)
      const result = schema.safeParse({ amount: 'abc' })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Please enter a valid positive amount')
      }
    })

    it('should reject zero amount', () => {
      const schema = createMintSchema(allowance)
      const result = schema.safeParse({ amount: '0' })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Please enter a valid positive amount')
      }
    })

    it('should reject negative amount', () => {
      const schema = createMintSchema(allowance)
      const result = schema.safeParse({ amount: '-100' })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Please enter a valid positive amount')
      }
    })

    it('should reject amount exceeding allowance', () => {
      const schema = createMintSchema(allowance)
      const result = schema.safeParse({ amount: '200000000000' })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Amount exceeds your mint allowance')
      }
    })
  })

  describe('formatMintAmount', () => {
    // Note: GalaChain quantity values are already actual token amounts - no decimal conversion needed
    it('should format large amounts with commas', () => {
      expect(formatMintAmount('1000', 8)).toBe('1,000.00')
      expect(formatMintAmount('1000000', 8)).toBe('1,000,000.00')
    })

    it('should format small amounts with precision', () => {
      expect(formatMintAmount('0.01', 8)).toBe('0.0100')
      expect(formatMintAmount('0.5', 8)).toBe('0.5000')
    })

    it('should format very small amounts in scientific notation', () => {
      const result = formatMintAmount('0.00001', 8)
      expect(result).toMatch(/e/)
    })

    it('should return 0 for empty string', () => {
      expect(formatMintAmount('', 8)).toBe('0')
    })

    it('should return 0 for invalid input', () => {
      expect(formatMintAmount('abc', 8)).toBe('0')
    })

    it('should handle zero', () => {
      expect(formatMintAmount('0', 8)).toBe('0')
    })

    it('should use default decimals parameter (no longer affects output)', () => {
      const resultDefault = formatMintAmount('100')
      const resultExplicit = formatMintAmount('100', 8)
      expect(resultDefault).toBe(resultExplicit)
    })

    it('should format amounts consistently regardless of decimals parameter', () => {
      // Since we no longer divide by decimals, the output should be the same
      expect(formatMintAmount('1000', 6)).toBe('1,000.00')
      expect(formatMintAmount('1', 8)).toBe('1.0000')
    })
  })
})
