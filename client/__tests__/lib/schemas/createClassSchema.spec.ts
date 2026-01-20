/**
 * Tests for createClassSchema validation
 */
import { describe, it, expect } from 'vitest'
import {
  isValidClassName,
  isValidClassIdentifier,
  isValidMaxSupply,
  isValidImageUrl,
  createClassSchema,
  formatMaxSupply,
  generateClassKey,
} from '@/lib/schemas/createClassSchema'

describe('createClassSchema', () => {
  describe('isValidClassName', () => {
    it('accepts valid class names', () => {
      expect(isValidClassName('Legendary Sword')).toBe(true)
      expect(isValidClassName('Epic-Item')).toBe(true)
      expect(isValidClassName('common_item')).toBe(true)
      expect(isValidClassName('Item123')).toBe(true)
      expect(isValidClassName('A')).toBe(true)
    })

    it('rejects invalid class names', () => {
      expect(isValidClassName('')).toBe(false)
      expect(isValidClassName('   ')).toBe(false)
      expect(isValidClassName('Item@123')).toBe(false)
      expect(isValidClassName('Item#123')).toBe(false)
      expect(isValidClassName('Item$123')).toBe(false)
    })

    it('rejects non-string values', () => {
      expect(isValidClassName(null as unknown as string)).toBe(false)
      expect(isValidClassName(undefined as unknown as string)).toBe(false)
      expect(isValidClassName(123 as unknown as string)).toBe(false)
    })
  })

  describe('isValidClassIdentifier', () => {
    it('accepts valid identifiers', () => {
      expect(isValidClassIdentifier('legendarysword')).toBe(true)
      expect(isValidClassIdentifier('item123')).toBe(true)
      expect(isValidClassIdentifier('EPIC')).toBe(true)
      expect(isValidClassIdentifier('A1B2C3')).toBe(true)
    })

    it('rejects invalid identifiers', () => {
      expect(isValidClassIdentifier('')).toBe(false)
      expect(isValidClassIdentifier('item with spaces')).toBe(false)
      expect(isValidClassIdentifier('item-dash')).toBe(false)
      expect(isValidClassIdentifier('item_underscore')).toBe(false)
      expect(isValidClassIdentifier('item@special')).toBe(false)
    })

    it('rejects non-string values', () => {
      expect(isValidClassIdentifier(null as unknown as string)).toBe(false)
      expect(isValidClassIdentifier(undefined as unknown as string)).toBe(false)
    })
  })

  describe('isValidMaxSupply', () => {
    it('accepts valid max supply values', () => {
      expect(isValidMaxSupply('')).toBe(true) // unlimited
      expect(isValidMaxSupply('1')).toBe(true)
      expect(isValidMaxSupply('100')).toBe(true)
      expect(isValidMaxSupply('1000000')).toBe(true)
    })

    it('rejects invalid max supply values', () => {
      expect(isValidMaxSupply('0')).toBe(false) // Zero not allowed
      expect(isValidMaxSupply('-1')).toBe(false)
      expect(isValidMaxSupply('abc')).toBe(false)
      expect(isValidMaxSupply('12.5')).toBe(false)
      expect(isValidMaxSupply('12abc')).toBe(false)
    })
  })

  describe('isValidImageUrl', () => {
    it('accepts valid URLs', () => {
      expect(isValidImageUrl('')).toBe(true) // optional
      expect(isValidImageUrl('https://example.com/image.png')).toBe(true)
      expect(isValidImageUrl('http://example.com/image.jpg')).toBe(true)
      expect(isValidImageUrl('https://cdn.example.com/path/to/image.webp')).toBe(true)
    })

    it('rejects invalid URLs', () => {
      expect(isValidImageUrl('not-a-url')).toBe(false)
      expect(isValidImageUrl('ftp://example.com/file')).toBe(false)
      expect(isValidImageUrl('file:///local/path')).toBe(false)
    })
  })

  describe('createClassSchema', () => {
    it('validates valid form data', () => {
      const result = createClassSchema.safeParse({
        name: 'Legendary Sword',
        additionalKey: 'legendarysword',
        description: 'A powerful weapon',
        image: 'https://example.com/sword.png',
        maxSupply: '100',
        rarity: 'Legendary',
      })
      expect(result.success).toBe(true)
    })

    it('validates minimal required data', () => {
      const result = createClassSchema.safeParse({
        name: 'Basic Item',
        additionalKey: 'basicitem',
      })
      expect(result.success).toBe(true)
    })

    it('rejects missing name', () => {
      const result = createClassSchema.safeParse({
        additionalKey: 'item',
      })
      expect(result.success).toBe(false)
    })

    it('rejects missing additionalKey', () => {
      const result = createClassSchema.safeParse({
        name: 'Item',
      })
      expect(result.success).toBe(false)
    })

    it('rejects invalid additionalKey', () => {
      const result = createClassSchema.safeParse({
        name: 'Item',
        additionalKey: 'invalid key with spaces',
      })
      expect(result.success).toBe(false)
    })

    it('rejects invalid image URL', () => {
      const result = createClassSchema.safeParse({
        name: 'Item',
        additionalKey: 'item',
        image: 'not-a-valid-url',
      })
      expect(result.success).toBe(false)
    })
  })

  describe('formatMaxSupply', () => {
    it('formats unlimited supply', () => {
      expect(formatMaxSupply('')).toBe('Unlimited')
      expect(formatMaxSupply(undefined)).toBe('Unlimited')
      expect(formatMaxSupply('0')).toBe('Unlimited')
    })

    it('formats numeric supply', () => {
      expect(formatMaxSupply('1')).toBe('1')
      expect(formatMaxSupply('100')).toBe('100')
      expect(formatMaxSupply('1000')).toBe('1,000')
      expect(formatMaxSupply('1000000')).toBe('1,000,000')
    })
  })

  describe('generateClassKey', () => {
    it('generates correct class key', () => {
      expect(generateClassKey('MyCollection', 'NFT', 'Weapon', 'sword')).toBe(
        'MyCollection|NFT|Weapon|sword'
      )
    })

    it('handles empty additionalKey', () => {
      expect(generateClassKey('MyCollection', 'NFT', 'Weapon', '')).toBe(
        'MyCollection|NFT|Weapon|'
      )
    })
  })
})
