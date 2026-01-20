import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  ERROR_MESSAGES,
  GalaChainError,
  getErrorMessage,
  extractError,
  isSuccess,
  isError,
  handleResponse,
  parseWalletError,
  logError,
} from '@/lib/galachainErrors'
import { GalaChainResponseType } from '@shared/types/galachain'
import type { GalaChainResponse } from '@shared/types/galachain'

describe('galachainErrors', () => {
  describe('GalaChainError', () => {
    it('should create an error with message and code', () => {
      const error = new GalaChainError('Test message', 'TEST_CODE')
      expect(error.message).toBe('Test message')
      expect(error.code).toBe('TEST_CODE')
      expect(error.name).toBe('GalaChainError')
    })

    it('should use UNKNOWN_ERROR as default code', () => {
      const error = new GalaChainError('Test message')
      expect(error.code).toBe('UNKNOWN_ERROR')
    })

    it('should include optional errorKey and errorPayload', () => {
      const payload = { detail: 'test' }
      const error = new GalaChainError('Test', 'CODE', 'KEY', payload)
      expect(error.errorKey).toBe('KEY')
      expect(error.errorPayload).toEqual(payload)
    })
  })

  describe('getErrorMessage', () => {
    it('should return message for known error codes', () => {
      expect(getErrorMessage('INSUFFICIENT_BALANCE')).toBe(
        'You do not have enough tokens for this operation.'
      )
      expect(getErrorMessage('UNAUTHORIZED')).toBe(
        'You are not authorized to perform this action.'
      )
      expect(getErrorMessage('TOKEN_NOT_FOUND')).toBe(
        'The specified token does not exist.'
      )
    })

    it('should handle case-insensitive error codes', () => {
      expect(getErrorMessage('insufficient_balance')).toBe(
        'You do not have enough tokens for this operation.'
      )
    })

    it('should match partial patterns for balance errors', () => {
      expect(getErrorMessage('SOME_INSUFFICIENT_FUNDS_ERROR')).toBe(
        'You do not have enough tokens for this operation.'
      )
    })

    it('should match partial patterns for authorization errors', () => {
      expect(getErrorMessage('SOME_UNAUTHORIZED_ACTION')).toBe(
        'You are not authorized to perform this action.'
      )
      expect(getErrorMessage('FORBIDDEN_ACCESS')).toBe(
        'You are not authorized to perform this action.'
      )
    })

    it('should match partial patterns for allowance errors', () => {
      expect(getErrorMessage('SOME_ALLOWANCE_ERROR')).toBe(
        'This operation exceeds your allowance limit.'
      )
    })

    it('should match partial patterns for not found errors', () => {
      expect(getErrorMessage('ITEM_NOT_FOUND')).toBe(
        'The specified token does not exist.'
      )
    })

    it('should match partial patterns for invalid errors', () => {
      expect(getErrorMessage('SOME_INVALID_PARAM')).toBe(
        'The request data is invalid. Please check your inputs.'
      )
    })

    it('should return fallback message for unknown codes', () => {
      expect(getErrorMessage('COMPLETELY_UNKNOWN_CODE')).toBe(
        'Operation failed: COMPLETELY_UNKNOWN_CODE'
      )
    })

    it('should handle undefined error code', () => {
      expect(getErrorMessage(undefined)).toBe(ERROR_MESSAGES.UNKNOWN_ERROR)
    })
  })

  describe('extractError', () => {
    it('should extract error from response with ErrorCode', () => {
      const response: GalaChainResponse<unknown> = {
        Status: 0,
        ErrorCode: 'INSUFFICIENT_BALANCE',
        Message: 'Custom message',
      }
      const error = extractError(response)
      expect(error).toBeInstanceOf(GalaChainError)
      expect(error.message).toBe('Custom message')
      expect(error.code).toBe('INSUFFICIENT_BALANCE')
    })

    it('should use default message if Message is missing', () => {
      const response: GalaChainResponse<unknown> = {
        Status: 0,
        ErrorCode: 'UNAUTHORIZED',
      }
      const error = extractError(response)
      expect(error.message).toBe(ERROR_MESSAGES.UNAUTHORIZED)
    })

    it('should include ErrorKey and ErrorPayload', () => {
      const response: GalaChainResponse<unknown> = {
        Status: 0,
        ErrorCode: 'ERROR',
        ErrorKey: 'key',
        ErrorPayload: { data: 'test' },
      }
      const error = extractError(response)
      expect(error.errorKey).toBe('key')
      expect(error.errorPayload).toEqual({ data: 'test' })
    })
  })

  describe('isSuccess', () => {
    it('should return true for successful response', () => {
      const response: GalaChainResponse<string> = {
        Status: GalaChainResponseType.Success,
        Data: 'result',
      }
      expect(isSuccess(response)).toBe(true)
    })

    it('should return false for error response', () => {
      const response: GalaChainResponse<string> = {
        Status: 0,
        ErrorCode: 'ERROR',
      }
      expect(isSuccess(response)).toBe(false)
    })
  })

  describe('isError', () => {
    it('should return false for successful response', () => {
      const response: GalaChainResponse<string> = {
        Status: GalaChainResponseType.Success,
        Data: 'result',
      }
      expect(isError(response)).toBe(false)
    })

    it('should return true for error response', () => {
      const response: GalaChainResponse<string> = {
        Status: 0,
        ErrorCode: 'ERROR',
      }
      expect(isError(response)).toBe(true)
    })
  })

  describe('handleResponse', () => {
    it('should return data for successful response', () => {
      const response: GalaChainResponse<string> = {
        Status: GalaChainResponseType.Success,
        Data: 'test data',
      }
      expect(handleResponse(response)).toBe('test data')
    })

    it('should throw GalaChainError for error response', () => {
      const response: GalaChainResponse<string> = {
        Status: 0,
        ErrorCode: 'INSUFFICIENT_BALANCE',
        Message: 'Not enough tokens',
      }
      expect(() => handleResponse(response)).toThrow(GalaChainError)
      expect(() => handleResponse(response)).toThrow('Not enough tokens')
    })
  })

  describe('parseWalletError', () => {
    it('should parse user rejected errors', () => {
      const error = new Error('User rejected the request')
      expect(parseWalletError(error)).toBe(
        'Transaction was rejected. Please approve the transaction in your wallet to continue.'
      )
    })

    it('should parse user denied errors', () => {
      const error = new Error('User denied transaction signature')
      expect(parseWalletError(error)).toBe(
        'Transaction was rejected. Please approve the transaction in your wallet to continue.'
      )
    })

    it('should parse locked wallet errors', () => {
      const error = new Error('MetaMask is locked')
      expect(parseWalletError(error)).toBe(
        'Your wallet is locked. Please unlock your wallet and try again.'
      )
    })

    it('should parse no provider errors', () => {
      const error = new Error('No ethereum provider found')
      expect(parseWalletError(error)).toBe(
        'No wallet provider found. Please install MetaMask.'
      )
    })

    it('should parse pending request errors', () => {
      const error = new Error('Request already pending')
      expect(parseWalletError(error)).toBe(
        'A request is already pending. Please check your wallet.'
      )
    })

    it('should parse network errors', () => {
      const error = new Error('Network error occurred')
      expect(parseWalletError(error)).toBe(
        'A network error occurred. Please check your connection and try again.'
      )
    })

    it('should parse timeout errors', () => {
      const error = new Error('Request timed out')
      expect(parseWalletError(error)).toBe(
        'The operation timed out. Please try again.'
      )
    })

    it('should return original message for unrecognized errors', () => {
      const error = new Error('Some specific error')
      expect(parseWalletError(error)).toBe('Some specific error')
    })

    it('should handle string errors', () => {
      expect(parseWalletError('String error')).toBe('String error')
    })

    it('should handle non-Error objects', () => {
      expect(parseWalletError({ foo: 'bar' })).toBe(
        'An unexpected error occurred. Please try again.'
      )
    })
  })

  describe('logError', () => {
    let consoleErrorSpy: ReturnType<typeof vi.spyOn>

    beforeEach(() => {
      consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      vi.stubEnv('DEV', true)
    })

    afterEach(() => {
      consoleErrorSpy.mockRestore()
      vi.unstubAllEnvs()
    })

    it('should log error in development mode', () => {
      const error = new GalaChainError('Test', 'CODE', 'KEY', { data: 1 })
      logError('context', error)

      expect(consoleErrorSpy).toHaveBeenCalledWith('[GalaChain:context]', error)
      expect(consoleErrorSpy).toHaveBeenCalledWith('  Code: CODE')
      expect(consoleErrorSpy).toHaveBeenCalledWith('  Key: KEY')
      expect(consoleErrorSpy).toHaveBeenCalledWith('  Payload:', { data: 1 })
    })

    it('should log non-GalaChainError', () => {
      const error = new Error('Regular error')
      logError('test', error)

      expect(consoleErrorSpy).toHaveBeenCalledWith('[GalaChain:test]', error)
    })
  })

  describe('ERROR_MESSAGES coverage', () => {
    it('should have messages for all common error codes', () => {
      const commonCodes = [
        'INSUFFICIENT_BALANCE',
        'UNAUTHORIZED',
        'TOKEN_NOT_FOUND',
        'INVALID_SIGNATURE',
        'ALLOWANCE_EXCEEDED',
        'MAX_SUPPLY_EXCEEDED',
        'TOKENS_LOCKED',
        'TIMEOUT',
        'NETWORK_ERROR',
      ]

      for (const code of commonCodes) {
        expect(ERROR_MESSAGES[code]).toBeDefined()
        expect(typeof ERROR_MESSAGES[code]).toBe('string')
        expect(ERROR_MESSAGES[code].length).toBeGreaterThan(10)
      }
    })
  })
})
