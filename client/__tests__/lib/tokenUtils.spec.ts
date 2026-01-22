import { describe, it, expect } from 'vitest'
import { getTokenIdentifier, type TokenIdentifiable } from '@/lib/tokenUtils'

describe('tokenUtils', () => {
  describe('getTokenIdentifier', () => {
    it('returns collection when collection is not "Token"', () => {
      const token: TokenIdentifiable = {
        collection: 'GALA',
        type: 'SomeType',
      }
      expect(getTokenIdentifier(token)).toBe('GALA')
    })

    it('returns type when collection is "Token"', () => {
      const token: TokenIdentifiable = {
        collection: 'Token',
        type: 'MyCustomToken',
      }
      expect(getTokenIdentifier(token)).toBe('MyCustomToken')
    })

    it('handles custom collection names correctly', () => {
      const testCases: Array<{ token: TokenIdentifiable; expected: string }> = [
        // Custom collections - should return collection name
        { token: { collection: 'GALA', type: 'GALA' }, expected: 'GALA' },
        { token: { collection: 'SILK', type: 'SILK' }, expected: 'SILK' },
        { token: { collection: 'MyNFTCollection', type: 'Warrior' }, expected: 'MyNFTCollection' },
        { token: { collection: 'GameItems', type: 'Sword' }, expected: 'GameItems' },
        // Default 'Token' collection - should return type
        { token: { collection: 'Token', type: 'CustomToken' }, expected: 'CustomToken' },
        { token: { collection: 'Token', type: 'RewardToken' }, expected: 'RewardToken' },
      ]

      testCases.forEach(({ token, expected }) => {
        expect(getTokenIdentifier(token)).toBe(expected)
      })
    })

    it('is case-sensitive for "Token" collection check', () => {
      // 'token' (lowercase) is not the default, so should return 'token'
      const lowercaseToken: TokenIdentifiable = {
        collection: 'token',
        type: 'MyType',
      }
      expect(getTokenIdentifier(lowercaseToken)).toBe('token')

      // 'TOKEN' (uppercase) is not the default, so should return 'TOKEN'
      const uppercaseToken: TokenIdentifiable = {
        collection: 'TOKEN',
        type: 'MyType',
      }
      expect(getTokenIdentifier(uppercaseToken)).toBe('TOKEN')

      // Only exact 'Token' should trigger type fallback
      const exactToken: TokenIdentifiable = {
        collection: 'Token',
        type: 'MyType',
      }
      expect(getTokenIdentifier(exactToken)).toBe('MyType')
    })

    it('handles empty strings', () => {
      // Empty collection (not 'Token') - returns empty collection
      const emptyCollection: TokenIdentifiable = {
        collection: '',
        type: 'SomeType',
      }
      expect(getTokenIdentifier(emptyCollection)).toBe('')

      // Collection is 'Token', empty type - returns empty type
      const emptyType: TokenIdentifiable = {
        collection: 'Token',
        type: '',
      }
      expect(getTokenIdentifier(emptyType)).toBe('')
    })

    it('handles tokens with same collection and type', () => {
      // When collection and type are the same (and not 'Token'), returns collection
      const sameNameToken: TokenIdentifiable = {
        collection: 'GALA',
        type: 'GALA',
      }
      expect(getTokenIdentifier(sameNameToken)).toBe('GALA')
    })

    it('handles whitespace in values', () => {
      const whitespaceToken: TokenIdentifiable = {
        collection: 'Token ',
        type: 'MyType',
      }
      // 'Token ' (with space) is not equal to 'Token', so returns 'Token '
      expect(getTokenIdentifier(whitespaceToken)).toBe('Token ')
    })
  })
})
