/**
 * GalaChain error handling utilities
 * Maps GalaChainResponse error codes to user-friendly messages
 */

import type { GalaChainResponse } from '@shared/types/galachain'
import { GalaChainResponseType } from '@shared/types/galachain'

/**
 * Known GalaChain error codes and their user-friendly messages
 */
export const ERROR_MESSAGES: Record<string, string> = {
  // Balance/Quantity errors
  INSUFFICIENT_BALANCE: 'You do not have enough tokens for this operation.',
  INSUFFICIENT_QUANTITY: 'The specified quantity exceeds your available balance.',
  BALANCE_NOT_FOUND: 'No balance found for this token.',

  // Authorization errors
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  NOT_AUTHORIZED: 'You are not authorized to perform this action.',
  FORBIDDEN: 'This action is forbidden for your account.',
  MINT_AUTHORITY_REQUIRED: 'You do not have mint authority for this token.',
  BURN_AUTHORITY_REQUIRED: 'You do not have burn authority for this token.',

  // Allowance errors
  ALLOWANCE_EXCEEDED: 'This operation exceeds your allowance limit.',
  NO_ALLOWANCE: 'You do not have an allowance for this operation.',
  ALLOWANCE_NOT_FOUND: 'No allowance found for this token.',
  MINT_ALLOWANCE_EXCEEDED: 'This operation exceeds your mint allowance.',

  // Token errors
  TOKEN_NOT_FOUND: 'The specified token does not exist.',
  TOKEN_CLASS_NOT_FOUND: 'The specified token class does not exist.',
  TOKEN_INSTANCE_NOT_FOUND: 'The specified token instance does not exist.',
  INVALID_TOKEN_CLASS: 'Invalid token class specified.',
  DUPLICATE_TOKEN: 'A token with this identifier already exists.',

  // Signature/validation errors
  INVALID_SIGNATURE: 'Transaction signature is invalid. Please try again.',
  SIGNATURE_REQUIRED: 'This operation requires a valid signature.',
  INVALID_DTO: 'The request data is invalid. Please check your inputs.',
  VALIDATION_FAILED: 'Request validation failed. Please check your inputs.',

  // User errors
  USER_NOT_FOUND: 'User not found.',
  INVALID_USER: 'Invalid user specified.',
  SELF_TRANSFER: 'You cannot transfer tokens to yourself.',

  // Supply errors
  MAX_SUPPLY_EXCEEDED: 'This operation would exceed the maximum token supply.',
  SUPPLY_LIMIT_REACHED: 'The supply limit has been reached for this token.',

  // Lock errors
  TOKENS_LOCKED: 'The tokens are currently locked and cannot be transferred.',
  LOCK_NOT_FOUND: 'Token lock not found.',

  // Network/transaction errors
  TRANSACTION_FAILED: 'The transaction failed. Please try again.',
  TIMEOUT: 'The operation timed out. Please try again.',
  NETWORK_ERROR: 'A network error occurred. Please check your connection.',

  // Generic errors
  UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.',
  INTERNAL_ERROR: 'An internal error occurred. Please try again later.',
}

/**
 * Error class for GalaChain operations
 */
export class GalaChainError extends Error {
  public readonly code: string
  public readonly errorKey?: string
  public readonly errorPayload?: unknown

  constructor(
    message: string,
    code: string = 'UNKNOWN_ERROR',
    errorKey?: string,
    errorPayload?: unknown
  ) {
    super(message)
    this.name = 'GalaChainError'
    this.code = code
    this.errorKey = errorKey
    this.errorPayload = errorPayload
  }
}

/**
 * Get a user-friendly error message from a GalaChain error code
 */
export function getErrorMessage(errorCode: string | undefined): string {
  if (!errorCode) {
    return ERROR_MESSAGES.UNKNOWN_ERROR
  }

  // Try exact match first
  const exactMatch = ERROR_MESSAGES[errorCode]
  if (exactMatch) {
    return exactMatch
  }

  // Try case-insensitive match
  const upperCode = errorCode.toUpperCase()
  const upperMatch = ERROR_MESSAGES[upperCode]
  if (upperMatch) {
    return upperMatch
  }

  // Try partial match for common patterns
  if (upperCode.includes('INSUFFICIENT') || upperCode.includes('BALANCE')) {
    return ERROR_MESSAGES.INSUFFICIENT_BALANCE
  }
  if (upperCode.includes('UNAUTHORIZED') || upperCode.includes('FORBIDDEN')) {
    return ERROR_MESSAGES.UNAUTHORIZED
  }
  if (upperCode.includes('ALLOWANCE')) {
    return ERROR_MESSAGES.ALLOWANCE_EXCEEDED
  }
  if (upperCode.includes('NOT_FOUND')) {
    return ERROR_MESSAGES.TOKEN_NOT_FOUND
  }
  if (upperCode.includes('INVALID')) {
    return ERROR_MESSAGES.INVALID_DTO
  }

  // Return the error code itself as a fallback
  return `Operation failed: ${errorCode}`
}

/**
 * Extract a user-friendly error from a GalaChainResponse
 * Note: ErrorCode is a number, ErrorKey is the string identifier
 */
export function extractError(response: GalaChainResponse<unknown>): GalaChainError {
  // Use ErrorKey for the string-based error code, fall back to ErrorCode number
  const errorKey = response.ErrorKey || (response.ErrorCode !== undefined ? String(response.ErrorCode) : undefined)
  const message = response.Message || getErrorMessage(errorKey)
  return new GalaChainError(
    message,
    errorKey || 'UNKNOWN_ERROR',
    response.ErrorKey,
    response.ErrorPayload
  )
}

/**
 * Check if a GalaChainResponse indicates success
 */
export function isSuccess<T>(response: GalaChainResponse<T>): response is GalaChainResponse<T> & { Data: T } {
  return response.Status === GalaChainResponseType.Success
}

/**
 * Check if a GalaChainResponse indicates an error
 */
export function isError<T>(response: GalaChainResponse<T>): boolean {
  return response.Status !== GalaChainResponseType.Success
}

/**
 * Handle a GalaChainResponse, throwing an error if unsuccessful
 */
export function handleResponse<T>(response: GalaChainResponse<T>): T {
  if (isSuccess(response)) {
    return response.Data
  }
  throw extractError(response)
}

/**
 * Parse wallet-related errors (MetaMask, connection errors)
 */
export function parseWalletError(err: unknown): string {
  if (err instanceof Error) {
    const message = err.message.toLowerCase()

    // User rejected the transaction
    if (message.includes('user rejected') || message.includes('user denied')) {
      return 'Transaction was rejected. Please approve the transaction in your wallet to continue.'
    }

    // User rejected connection
    if (message.includes('rejected request')) {
      return 'Connection request was rejected. Please approve the connection in your wallet.'
    }

    // MetaMask is locked
    if (message.includes('locked') || message.includes('unlock')) {
      return 'Your wallet is locked. Please unlock your wallet and try again.'
    }

    // No provider found
    if (message.includes('no provider') || message.includes('ethereum provider') || message.includes('not found')) {
      return 'No wallet provider found. Please install MetaMask.'
    }

    // Already processing a request
    if (message.includes('already pending') || message.includes('pending request')) {
      return 'A request is already pending. Please check your wallet.'
    }

    // Network error
    if (message.includes('network') || message.includes('connection') || message.includes('fetch')) {
      return 'A network error occurred. Please check your connection and try again.'
    }

    // Timeout
    if (message.includes('timeout') || message.includes('timed out')) {
      return 'The operation timed out. Please try again.'
    }

    return err.message
  }

  if (typeof err === 'string') {
    return err
  }

  return 'An unexpected error occurred. Please try again.'
}

/**
 * Log errors in development mode
 */
export function logError(context: string, error: unknown): void {
  if (import.meta.env.DEV) {
    console.error(`[GalaChain:${context}]`, error)
    if (error instanceof GalaChainError) {
      console.error(`  Code: ${error.code}`)
      if (error.errorKey) console.error(`  Key: ${error.errorKey}`)
      if (error.errorPayload) console.error(`  Payload:`, error.errorPayload)
    }
  }
}
