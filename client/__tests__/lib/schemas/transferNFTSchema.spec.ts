import { describe, it, expect } from 'vitest'
import {
  createTransferNFTSchema,
  truncateAddress,
  truncateInstanceId,
  isValidGalaChainAddress,
} from '@/lib/schemas/transferNFTSchema'

describe('transferNFTSchema', () => {
  describe('isValidGalaChainAddress', () => {
    it('should accept valid client| prefixed addresses', () => {
      expect(isValidGalaChainAddress('client|abc123def456789012345678901234567890')).toBe(true)
      expect(isValidGalaChainAddress('client|a1b2c3d4e5f6789012345678901234567890')).toBe(true)
    })

    it('should accept valid eth| prefixed addresses', () => {
      expect(isValidGalaChainAddress('eth|abc123def456789012345678901234567890')).toBe(true)
      expect(isValidGalaChainAddress('eth|a1b2c3d4e5f6789012345678901234567890')).toBe(true)
    })

    it('should accept valid 0x prefixed Ethereum addresses', () => {
      expect(isValidGalaChainAddress('0x1234567890abcdef1234567890abcdef12345678')).toBe(true)
      expect(isValidGalaChainAddress('0xABCDEF1234567890abcdef1234567890ABCDEF12')).toBe(true)
    })

    it('should reject invalid addresses', () => {
      expect(isValidGalaChainAddress('')).toBe(false)
      expect(isValidGalaChainAddress('invalid')).toBe(false)
      expect(isValidGalaChainAddress('client|')).toBe(false)
      expect(isValidGalaChainAddress('|abc123')).toBe(false)
      expect(isValidGalaChainAddress('unknown|abc123def456789012345678901234567890')).toBe(false)
      expect(isValidGalaChainAddress('0x123')).toBe(false) // Too short
      expect(isValidGalaChainAddress('0xGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG')).toBe(false) // Invalid hex
    })

    it('should handle null and undefined', () => {
      expect(isValidGalaChainAddress(null as unknown as string)).toBe(false)
      expect(isValidGalaChainAddress(undefined as unknown as string)).toBe(false)
    })
  })

  describe('createTransferNFTSchema', () => {
    // Note: GalaChain addresses after the prefix must be valid hex (a-f, 0-9 only)
    const fromAddress = 'client|aaaa1234567890abcdef1234567890'

    it('should validate a valid recipient address', () => {
      const schema = createTransferNFTSchema(fromAddress)
      const result = schema.safeParse({
        recipientAddress: 'client|bbbb1234567890abcdef1234567890',
      })
      expect(result.success).toBe(true)
    })

    it('should reject empty recipient address', () => {
      const schema = createTransferNFTSchema(fromAddress)
      const result = schema.safeParse({
        recipientAddress: '',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Recipient address is required')
      }
    })

    it('should reject invalid recipient address format', () => {
      const schema = createTransferNFTSchema(fromAddress)
      const result = schema.safeParse({
        recipientAddress: 'invalid-address',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('valid GalaChain address')
      }
    })

    it('should reject transfer to self', () => {
      const schema = createTransferNFTSchema(fromAddress)
      const result = schema.safeParse({
        recipientAddress: fromAddress,
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Cannot transfer to yourself')
      }
    })

    it('should reject transfer to self (case insensitive)', () => {
      const schema = createTransferNFTSchema(fromAddress)
      const result = schema.safeParse({
        recipientAddress: fromAddress.toUpperCase(),
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Cannot transfer to yourself')
      }
    })

    it('should accept 0x prefixed addresses', () => {
      const schema = createTransferNFTSchema(fromAddress)
      const result = schema.safeParse({
        recipientAddress: '0x1234567890abcdef1234567890abcdef12345678',
      })
      expect(result.success).toBe(true)
    })
  })

  describe('truncateAddress', () => {
    it('should truncate long addresses', () => {
      const address = 'client|abcdefghijklmnopqrstuvwxyz1234567890'
      const result = truncateAddress(address)
      expect(result).toBe('client|abcde...34567890')
    })

    it('should not truncate short addresses', () => {
      const address = 'client|abc123'
      const result = truncateAddress(address)
      expect(result).toBe('client|abc123')
    })

    it('should handle empty strings', () => {
      expect(truncateAddress('')).toBe('')
    })

    it('should support custom truncation lengths', () => {
      const address = 'client|abcdefghijklmnopqrstuvwxyz1234567890'
      const result = truncateAddress(address, 6, 4)
      expect(result).toBe('client...7890')
    })
  })

  describe('truncateInstanceId', () => {
    it('should truncate long instance IDs', () => {
      const instanceId = '123456789012345678901234567890'
      const result = truncateInstanceId(instanceId)
      expect(result).toBe('1234...7890')
    })

    it('should not truncate short instance IDs', () => {
      const instanceId = '12345678'
      const result = truncateInstanceId(instanceId)
      expect(result).toBe('12345678')
    })

    it('should handle empty strings', () => {
      expect(truncateInstanceId('')).toBe('')
    })

    it('should support custom max length', () => {
      const instanceId = '123456789012345678901234567890'
      const result = truncateInstanceId(instanceId, 12)
      expect(result).toBe('123456...567890')
    })
  })
})
