/**
 * Tests for create collection validation schema
 */

import { describe, it, expect } from 'vitest'
import {
  isValidIdentifier,
  isValidImageUrl,
  isValidMaxSupply,
  createCollectionSchema,
  formatMaxSupply,
  defaultCollectionFormValues,
} from '@/lib/schemas/createCollectionSchema'

describe('createCollectionSchema', () => {
  describe('isValidIdentifier', () => {
    it('returns true for valid alphanumeric identifiers', () => {
      expect(isValidIdentifier('myCollection')).toBe(true)
      expect(isValidIdentifier('my-collection')).toBe(true)
      expect(isValidIdentifier('my_collection')).toBe(true)
      expect(isValidIdentifier('MyCollection123')).toBe(true)
    })

    it('returns false for empty string', () => {
      expect(isValidIdentifier('')).toBe(false)
    })

    it('returns false for strings with special characters', () => {
      expect(isValidIdentifier('my collection')).toBe(false) // space
      expect(isValidIdentifier('my.collection')).toBe(false) // dot
      expect(isValidIdentifier('my@collection')).toBe(false) // @
      expect(isValidIdentifier('my#collection')).toBe(false) // #
    })

    it('returns false for strings exceeding max length', () => {
      const longString = 'a'.repeat(65) // 65 chars, max is 64
      expect(isValidIdentifier(longString)).toBe(false)
    })

    it('returns true for strings at max length', () => {
      const maxLengthString = 'a'.repeat(64)
      expect(isValidIdentifier(maxLengthString)).toBe(true)
    })

    it('returns true for single character', () => {
      expect(isValidIdentifier('a')).toBe(true)
      expect(isValidIdentifier('1')).toBe(true)
    })
  })

  describe('isValidImageUrl', () => {
    it('returns true for valid HTTPS URLs', () => {
      expect(isValidImageUrl('https://example.com/image.png')).toBe(true)
      expect(isValidImageUrl('https://cdn.example.org/path/to/image.jpg')).toBe(true)
    })

    it('returns true for valid HTTP URLs', () => {
      expect(isValidImageUrl('http://example.com/image.png')).toBe(true)
    })

    it('returns false for invalid URLs', () => {
      expect(isValidImageUrl('not-a-url')).toBe(false)
      expect(isValidImageUrl('example.com/image.png')).toBe(false)
      expect(isValidImageUrl('//example.com/image.png')).toBe(false)
    })

    it('returns false for non-HTTP protocols', () => {
      expect(isValidImageUrl('ftp://example.com/image.png')).toBe(false)
      expect(isValidImageUrl('file:///path/to/image.png')).toBe(false)
      expect(isValidImageUrl('data:image/png;base64,abc')).toBe(false)
    })

    it('returns false for empty string', () => {
      expect(isValidImageUrl('')).toBe(false)
    })
  })

  describe('isValidMaxSupply', () => {
    it('returns true for empty string (unlimited)', () => {
      expect(isValidMaxSupply('')).toBe(true)
    })

    it('returns true for undefined (unlimited)', () => {
      expect(isValidMaxSupply(undefined as unknown as string)).toBe(true)
    })

    it('returns true for positive integers', () => {
      expect(isValidMaxSupply('100')).toBe(true)
      expect(isValidMaxSupply('1000000')).toBe(true)
      expect(isValidMaxSupply(0)).toBe(true)
      expect(isValidMaxSupply(100)).toBe(true)
    })

    it('returns false for negative numbers', () => {
      expect(isValidMaxSupply('-1')).toBe(false)
      expect(isValidMaxSupply(-100)).toBe(false)
    })

    it('returns false for decimals', () => {
      expect(isValidMaxSupply('1.5')).toBe(false)
      expect(isValidMaxSupply('100.99')).toBe(false)
    })

    it('returns false for non-numeric strings', () => {
      expect(isValidMaxSupply('abc')).toBe(false)
      expect(isValidMaxSupply('12abc')).toBe(false)
    })
  })

  describe('createCollectionSchema', () => {
    it('validates complete valid form data', () => {
      const result = createCollectionSchema.safeParse({
        collection: 'my-collection',
        category: 'Item',
        type: 'common',
        additionalKey: 'none',
        name: 'My Awesome Collection',
        symbol: 'MAC',
        description: 'A test collection',
        image: 'https://example.com/image.png',
        isNonFungible: true,
        decimals: 0,
        maxSupply: '',
      })
      expect(result.success).toBe(true)
    })

    it('validates minimal required fields', () => {
      const result = createCollectionSchema.safeParse({
        collection: 'test',
        category: 'Item',
        type: 'nft',
        name: 'Test',
        symbol: 'T',
        image: 'https://example.com/img.png',
      })
      expect(result.success).toBe(true)
    })

    it('rejects missing collection', () => {
      const result = createCollectionSchema.safeParse({
        collection: '',
        category: 'Item',
        type: 'nft',
        name: 'Test',
        symbol: 'T',
        image: 'https://example.com/img.png',
      })
      expect(result.success).toBe(false)
    })

    it('rejects missing name', () => {
      const result = createCollectionSchema.safeParse({
        collection: 'test',
        category: 'Item',
        type: 'nft',
        name: '',
        symbol: 'T',
        image: 'https://example.com/img.png',
      })
      expect(result.success).toBe(false)
    })

    it('rejects missing symbol', () => {
      const result = createCollectionSchema.safeParse({
        collection: 'test',
        category: 'Item',
        type: 'nft',
        name: 'Test',
        symbol: '',
        image: 'https://example.com/img.png',
      })
      expect(result.success).toBe(false)
    })

    it('rejects invalid image URL', () => {
      const result = createCollectionSchema.safeParse({
        collection: 'test',
        category: 'Item',
        type: 'nft',
        name: 'Test',
        symbol: 'T',
        image: 'not-a-url',
      })
      expect(result.success).toBe(false)
    })

    it('uppercases symbol', () => {
      const result = createCollectionSchema.safeParse({
        collection: 'test',
        category: 'Item',
        type: 'nft',
        name: 'Test',
        symbol: 'abc',
        image: 'https://example.com/img.png',
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.symbol).toBe('ABC')
      }
    })

    it('rejects symbol longer than 10 characters', () => {
      const result = createCollectionSchema.safeParse({
        collection: 'test',
        category: 'Item',
        type: 'nft',
        name: 'Test',
        symbol: 'VERYLONGSYMBOL',
        image: 'https://example.com/img.png',
      })
      expect(result.success).toBe(false)
    })

    it('rejects name longer than 100 characters', () => {
      const result = createCollectionSchema.safeParse({
        collection: 'test',
        category: 'Item',
        type: 'nft',
        name: 'a'.repeat(101),
        symbol: 'T',
        image: 'https://example.com/img.png',
      })
      expect(result.success).toBe(false)
    })

    it('rejects description longer than 1000 characters', () => {
      const result = createCollectionSchema.safeParse({
        collection: 'test',
        category: 'Item',
        type: 'nft',
        name: 'Test',
        symbol: 'T',
        description: 'a'.repeat(1001),
        image: 'https://example.com/img.png',
      })
      expect(result.success).toBe(false)
    })

    it('rejects invalid identifier characters', () => {
      const result = createCollectionSchema.safeParse({
        collection: 'my collection', // space not allowed
        category: 'Item',
        type: 'nft',
        name: 'Test',
        symbol: 'T',
        image: 'https://example.com/img.png',
      })
      expect(result.success).toBe(false)
    })

    it('rejects negative decimals', () => {
      const result = createCollectionSchema.safeParse({
        collection: 'test',
        category: 'Item',
        type: 'token',
        name: 'Test',
        symbol: 'T',
        image: 'https://example.com/img.png',
        decimals: -1,
      })
      expect(result.success).toBe(false)
    })

    it('rejects decimals greater than 18', () => {
      const result = createCollectionSchema.safeParse({
        collection: 'test',
        category: 'Item',
        type: 'token',
        name: 'Test',
        symbol: 'T',
        image: 'https://example.com/img.png',
        decimals: 19,
      })
      expect(result.success).toBe(false)
    })

    it('accepts valid max supply', () => {
      const result = createCollectionSchema.safeParse({
        collection: 'test',
        category: 'Item',
        type: 'nft',
        name: 'Test',
        symbol: 'T',
        image: 'https://example.com/img.png',
        maxSupply: '1000',
      })
      expect(result.success).toBe(true)
    })

    it('rejects invalid max supply', () => {
      const result = createCollectionSchema.safeParse({
        collection: 'test',
        category: 'Item',
        type: 'nft',
        name: 'Test',
        symbol: 'T',
        image: 'https://example.com/img.png',
        maxSupply: '-1',
      })
      expect(result.success).toBe(false)
    })
  })

  describe('formatMaxSupply', () => {
    it('returns "Unlimited" for empty string', () => {
      expect(formatMaxSupply('')).toBe('Unlimited')
    })

    it('returns "Unlimited" for undefined', () => {
      expect(formatMaxSupply(undefined)).toBe('Unlimited')
    })

    it('returns "Unlimited" for zero', () => {
      expect(formatMaxSupply('0')).toBe('Unlimited')
      expect(formatMaxSupply(0)).toBe('Unlimited')
    })

    it('formats numbers with thousands separators', () => {
      expect(formatMaxSupply('1000')).toBe('1,000')
      expect(formatMaxSupply('1000000')).toBe('1,000,000')
      expect(formatMaxSupply(1000000)).toBe('1,000,000')
    })

    it('handles small numbers without separators', () => {
      expect(formatMaxSupply('100')).toBe('100')
      expect(formatMaxSupply('1')).toBe('1')
    })
  })

  describe('defaultCollectionFormValues', () => {
    it('has expected defaults', () => {
      expect(defaultCollectionFormValues.collection).toBe('')
      expect(defaultCollectionFormValues.category).toBe('Item')
      expect(defaultCollectionFormValues.type).toBe('')
      expect(defaultCollectionFormValues.additionalKey).toBe('none')
      expect(defaultCollectionFormValues.name).toBe('')
      expect(defaultCollectionFormValues.symbol).toBe('')
      expect(defaultCollectionFormValues.description).toBe('')
      expect(defaultCollectionFormValues.image).toBe('')
      expect(defaultCollectionFormValues.isNonFungible).toBe(true)
      expect(defaultCollectionFormValues.decimals).toBe(0)
      expect(defaultCollectionFormValues.maxSupply).toBe('')
    })
  })
})
