/**
 * Tests for burn validation schema
 */

import { describe, it, expect } from 'vitest'
import {
  isValidBurnAmount,
  isWithinBalance,
  createBurnSchema,
  formatBurnAmount,
} from '@/lib/schemas/burnSchema'

describe('burnSchema', () => {
  describe('isValidBurnAmount', () => {
    it('returns true for positive numeric strings', () => {
      expect(isValidBurnAmount('1')).toBe(true)
      expect(isValidBurnAmount('100')).toBe(true)
      expect(isValidBurnAmount('0.01')).toBe(true)
      expect(isValidBurnAmount('1000000000')).toBe(true)
    })

    it('returns false for zero', () => {
      expect(isValidBurnAmount('0')).toBe(false)
    })

    it('returns false for negative amounts', () => {
      expect(isValidBurnAmount('-1')).toBe(false)
      expect(isValidBurnAmount('-0.01')).toBe(false)
    })

    it('returns false for empty string', () => {
      expect(isValidBurnAmount('')).toBe(false)
    })

    it('returns false for whitespace only', () => {
      expect(isValidBurnAmount('   ')).toBe(false)
    })

    it('returns false for non-numeric strings', () => {
      expect(isValidBurnAmount('abc')).toBe(false)
      expect(isValidBurnAmount('1a2b')).toBe(false)
      expect(isValidBurnAmount('NaN')).toBe(false)
    })

    it('returns false for Infinity', () => {
      expect(isValidBurnAmount('Infinity')).toBe(false)
      expect(isValidBurnAmount('-Infinity')).toBe(false)
    })

    it('handles very small positive numbers', () => {
      expect(isValidBurnAmount('0.000000001')).toBe(true)
    })

    it('handles exponential notation', () => {
      expect(isValidBurnAmount('1e10')).toBe(true)
      expect(isValidBurnAmount('1e-10')).toBe(true)
    })
  })

  describe('isWithinBalance', () => {
    it('returns true when amount equals balance', () => {
      expect(isWithinBalance('100', '100')).toBe(true)
    })

    it('returns true when amount is less than balance', () => {
      expect(isWithinBalance('50', '100')).toBe(true)
      expect(isWithinBalance('1', '1000000')).toBe(true)
    })

    it('returns false when amount exceeds balance', () => {
      expect(isWithinBalance('101', '100')).toBe(false)
      expect(isWithinBalance('1000001', '1000000')).toBe(false)
    })

    it('returns false for empty value', () => {
      expect(isWithinBalance('', '100')).toBe(false)
    })

    it('returns false for invalid value', () => {
      expect(isWithinBalance('abc', '100')).toBe(false)
    })

    it('handles decimal amounts', () => {
      expect(isWithinBalance('99.99', '100')).toBe(true)
      expect(isWithinBalance('100.01', '100')).toBe(false)
    })

    it('handles large numbers', () => {
      expect(isWithinBalance('999999999999999999', '1000000000000000000')).toBe(true)
      expect(isWithinBalance('1000000000000000001', '1000000000000000000')).toBe(false)
    })
  })

  describe('createBurnSchema', () => {
    it('validates correct burn data', () => {
      const schema = createBurnSchema('1000')
      const result = schema.safeParse({
        amount: '500',
        confirmation: true,
      })
      expect(result.success).toBe(true)
    })

    it('requires amount to be provided', () => {
      const schema = createBurnSchema('1000')
      const result = schema.safeParse({
        amount: '',
        confirmation: true,
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Amount is required')
      }
    })

    it('rejects invalid amount format', () => {
      const schema = createBurnSchema('1000')
      const result = schema.safeParse({
        amount: 'abc',
        confirmation: true,
      })
      expect(result.success).toBe(false)
    })

    it('rejects amount exceeding balance', () => {
      const schema = createBurnSchema('1000')
      const result = schema.safeParse({
        amount: '1001',
        confirmation: true,
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Amount exceeds your available balance')
      }
    })

    it('requires confirmation checkbox to be true', () => {
      const schema = createBurnSchema('1000')
      const result = schema.safeParse({
        amount: '500',
        confirmation: false,
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('irreversible')
      }
    })

    it('accepts confirmation when true', () => {
      const schema = createBurnSchema('1000')
      const result = schema.safeParse({
        amount: '500',
        confirmation: true,
      })
      expect(result.success).toBe(true)
    })
  })

  describe('formatBurnAmount', () => {
    it('returns "0" for empty string', () => {
      expect(formatBurnAmount('')).toBe('0')
    })

    it('returns "0" for zero value', () => {
      expect(formatBurnAmount('0')).toBe('0')
    })

    it('returns "0" for NaN', () => {
      expect(formatBurnAmount('not-a-number')).toBe('0')
    })

    it('formats large numbers with thousands separators', () => {
      // 1000 * 10^8 = 100000000000
      expect(formatBurnAmount('100000000000', 8)).toBe('1,000.00')
    })

    it('formats smaller numbers with precision', () => {
      // 0.5 * 10^8 = 50000000
      expect(formatBurnAmount('50000000', 8)).toBe('0.5000')
    })

    it('uses exponential notation for very small numbers', () => {
      // 0.00001 * 10^8 = 1000
      expect(formatBurnAmount('1', 8)).toBe('1.00e-8')
    })

    it('respects decimal parameter', () => {
      // 10 with 2 decimals = 0.1
      expect(formatBurnAmount('10', 2)).toBe('0.1000')
    })

    it('handles whitespace', () => {
      expect(formatBurnAmount('   ')).toBe('0')
    })
  })
})
