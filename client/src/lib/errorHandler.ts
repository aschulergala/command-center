/**
 * Error handling utilities for the Vue client
 * Provides centralized error parsing, logging, and user-friendly messaging
 */

import {
  AppError,
  GalaChainError,
  WalletError,
  NetworkError,
  ValidationError,
  ErrorCode,
  ErrorSeverity,
  isAppError,
  getErrorMessage,
  getErrorAction,
} from '@shared/errors';

/**
 * Known wallet error patterns and their mappings
 */
const WALLET_ERROR_PATTERNS: Array<{
  pattern: RegExp | string;
  code: ErrorCode;
  message: string;
  action: string;
}> = [
  {
    pattern: /user rejected|user denied|rejected by user/i,
    code: ErrorCode.TRANSACTION_REJECTED,
    message: 'Transaction was rejected.',
    action: 'Please approve the transaction in your wallet to continue.',
  },
  {
    pattern: /rejected request|request rejected/i,
    code: ErrorCode.WALLET_CONNECTION_REJECTED,
    message: 'Connection request was rejected.',
    action: 'Please approve the connection in your wallet.',
  },
  {
    pattern: /wallet.*locked|unlock.*wallet/i,
    code: ErrorCode.WALLET_LOCKED,
    message: 'Your wallet is locked.',
    action: 'Please unlock your wallet and try again.',
  },
  {
    pattern: /no provider|ethereum provider|wallet not found|not installed/i,
    code: ErrorCode.WALLET_NOT_INSTALLED,
    message: 'No wallet provider found.',
    action: 'Please install MetaMask or another Web3 wallet.',
  },
  {
    pattern: /already pending|pending request|request already/i,
    code: ErrorCode.PENDING_REQUEST,
    message: 'A request is already pending.',
    action: 'Please check your wallet for pending requests.',
  },
  {
    pattern: /wrong network|chain.*mismatch|network.*mismatch/i,
    code: ErrorCode.WRONG_NETWORK,
    message: 'Wrong network selected.',
    action: 'Please switch to the correct network in your wallet.',
  },
];

/**
 * Known network error patterns
 */
const NETWORK_ERROR_PATTERNS: Array<{
  pattern: RegExp | string;
  code: ErrorCode;
  message: string;
  action: string;
}> = [
  {
    pattern: /network|connection|fetch|failed to fetch/i,
    code: ErrorCode.CONNECTION_FAILED,
    message: 'A network error occurred.',
    action: 'Please check your internet connection and try again.',
  },
  {
    pattern: /timeout|timed out/i,
    code: ErrorCode.TIMEOUT,
    message: 'The operation timed out.',
    action: 'The server took too long to respond. Please try again.',
  },
  {
    pattern: /500|internal server|server error/i,
    code: ErrorCode.API_ERROR,
    message: 'A server error occurred.',
    action: 'Please try again later. If the problem persists, contact support.',
  },
  {
    pattern: /502|503|504|bad gateway|service unavailable/i,
    code: ErrorCode.API_ERROR,
    message: 'The service is temporarily unavailable.',
    action: 'Please try again in a few moments.',
  },
];

/**
 * GalaChain error code mappings
 */
const GALACHAIN_ERROR_MAP: Record<string, { message: string; code: ErrorCode; action?: string }> = {
  // Balance/Quantity errors
  INSUFFICIENT_BALANCE: {
    message: 'You do not have enough tokens for this operation.',
    code: ErrorCode.INSUFFICIENT_BALANCE,
    action: 'Please check your balance and try with a smaller amount.',
  },
  INSUFFICIENT_QUANTITY: {
    message: 'The specified quantity exceeds your available balance.',
    code: ErrorCode.INSUFFICIENT_BALANCE,
  },
  BALANCE_NOT_FOUND: {
    message: 'No balance found for this token.',
    code: ErrorCode.INSUFFICIENT_BALANCE,
  },

  // Authorization errors
  UNAUTHORIZED: {
    message: 'You are not authorized to perform this action.',
    code: ErrorCode.UNAUTHORIZED,
    action: 'Please ensure you have the required permissions.',
  },
  NOT_AUTHORIZED: {
    message: 'You are not authorized to perform this action.',
    code: ErrorCode.UNAUTHORIZED,
  },
  FORBIDDEN: {
    message: 'This action is forbidden for your account.',
    code: ErrorCode.UNAUTHORIZED,
  },
  MINT_AUTHORITY_REQUIRED: {
    message: 'You do not have mint authority for this token.',
    code: ErrorCode.UNAUTHORIZED,
  },
  BURN_AUTHORITY_REQUIRED: {
    message: 'You do not have burn authority for this token.',
    code: ErrorCode.UNAUTHORIZED,
  },

  // Allowance errors
  ALLOWANCE_EXCEEDED: {
    message: 'This operation exceeds your allowance limit.',
    code: ErrorCode.ALLOWANCE_EXCEEDED,
    action: 'Please request a higher allowance or reduce the amount.',
  },
  NO_ALLOWANCE: {
    message: 'You do not have an allowance for this operation.',
    code: ErrorCode.ALLOWANCE_EXCEEDED,
  },
  ALLOWANCE_NOT_FOUND: {
    message: 'No allowance found for this token.',
    code: ErrorCode.ALLOWANCE_EXCEEDED,
  },
  MINT_ALLOWANCE_EXCEEDED: {
    message: 'This operation exceeds your mint allowance.',
    code: ErrorCode.ALLOWANCE_EXCEEDED,
  },

  // Token errors
  TOKEN_NOT_FOUND: {
    message: 'The specified token does not exist.',
    code: ErrorCode.TOKEN_NOT_FOUND,
  },
  TOKEN_CLASS_NOT_FOUND: {
    message: 'The specified token class does not exist.',
    code: ErrorCode.TOKEN_NOT_FOUND,
  },
  TOKEN_INSTANCE_NOT_FOUND: {
    message: 'The specified token instance does not exist.',
    code: ErrorCode.TOKEN_NOT_FOUND,
  },
  INVALID_TOKEN_CLASS: {
    message: 'Invalid token class specified.',
    code: ErrorCode.TOKEN_NOT_FOUND,
  },
  DUPLICATE_TOKEN: {
    message: 'A token with this identifier already exists.',
    code: ErrorCode.VALIDATION_FAILED,
  },

  // Signature/validation errors
  INVALID_SIGNATURE: {
    message: 'Transaction signature is invalid.',
    code: ErrorCode.INVALID_SIGNATURE,
    action: 'Please try signing the transaction again.',
  },
  SIGNATURE_REQUIRED: {
    message: 'This operation requires a valid signature.',
    code: ErrorCode.INVALID_SIGNATURE,
  },
  INVALID_DTO: {
    message: 'The request data is invalid.',
    code: ErrorCode.VALIDATION_FAILED,
    action: 'Please check your inputs and try again.',
  },
  VALIDATION_FAILED: {
    message: 'Request validation failed.',
    code: ErrorCode.VALIDATION_FAILED,
    action: 'Please check your inputs and try again.',
  },

  // User errors
  USER_NOT_FOUND: {
    message: 'User not found.',
    code: ErrorCode.VALIDATION_FAILED,
  },
  INVALID_USER: {
    message: 'Invalid user specified.',
    code: ErrorCode.VALIDATION_FAILED,
  },
  SELF_TRANSFER: {
    message: 'You cannot transfer tokens to yourself.',
    code: ErrorCode.VALIDATION_FAILED,
  },

  // Supply errors
  MAX_SUPPLY_EXCEEDED: {
    message: 'This operation would exceed the maximum token supply.',
    code: ErrorCode.MAX_SUPPLY_EXCEEDED,
    action: 'The token supply limit has been reached.',
  },
  SUPPLY_LIMIT_REACHED: {
    message: 'The supply limit has been reached for this token.',
    code: ErrorCode.MAX_SUPPLY_EXCEEDED,
  },

  // Lock errors
  TOKENS_LOCKED: {
    message: 'The tokens are currently locked and cannot be transferred.',
    code: ErrorCode.TOKENS_LOCKED,
    action: 'Please wait until the tokens are unlocked.',
  },
  LOCK_NOT_FOUND: {
    message: 'Token lock not found.',
    code: ErrorCode.TOKENS_LOCKED,
  },

  // Transaction errors
  TRANSACTION_FAILED: {
    message: 'The transaction failed.',
    code: ErrorCode.TRANSACTION_FAILED,
    action: 'Please try again.',
  },
};

/**
 * Parse a wallet error into a WalletError
 */
export function parseWalletError(error: unknown): WalletError {
  const errorMessage = error instanceof Error ? error.message : String(error);

  // Check against known patterns
  for (const { pattern, code, message, action } of WALLET_ERROR_PATTERNS) {
    const regex = typeof pattern === 'string' ? new RegExp(pattern, 'i') : pattern;
    if (regex.test(errorMessage)) {
      return new WalletError(message, {
        code,
        action,
        originalError: error,
      });
    }
  }

  // Default wallet error
  return new WalletError(
    error instanceof Error ? error.message : 'An unexpected wallet error occurred.',
    {
      code: ErrorCode.WALLET_ERROR,
      originalError: error,
    }
  );
}

/**
 * Parse a network error into a NetworkError
 */
export function parseNetworkError(error: unknown, statusCode?: number): NetworkError {
  const errorMessage = error instanceof Error ? error.message : String(error);

  // Check against known patterns
  for (const { pattern, code, message, action } of NETWORK_ERROR_PATTERNS) {
    const regex = typeof pattern === 'string' ? new RegExp(pattern, 'i') : pattern;
    if (regex.test(errorMessage)) {
      return new NetworkError(message, {
        code,
        statusCode,
        action,
        originalError: error,
      });
    }
  }

  // Default network error
  return new NetworkError(
    error instanceof Error ? error.message : 'A network error occurred.',
    {
      code: ErrorCode.NETWORK_ERROR,
      statusCode,
      originalError: error,
    }
  );
}

/**
 * Parse a GalaChain response error
 */
export function parseGalaChainError(
  errorKey?: string,
  message?: string,
  errorPayload?: unknown
): GalaChainError {
  // Try to find a known error mapping
  if (errorKey) {
    const mapping = GALACHAIN_ERROR_MAP[errorKey] || GALACHAIN_ERROR_MAP[errorKey.toUpperCase()];
    if (mapping) {
      return new GalaChainError(mapping.message, {
        code: mapping.code,
        errorKey,
        errorPayload,
        action: mapping.action,
      });
    }

    // Try partial matching
    const upperKey = errorKey.toUpperCase();
    for (const [key, mapping] of Object.entries(GALACHAIN_ERROR_MAP)) {
      if (upperKey.includes(key)) {
        return new GalaChainError(mapping.message, {
          code: mapping.code,
          errorKey,
          errorPayload,
          action: mapping.action,
        });
      }
    }
  }

  // Use provided message or default
  return new GalaChainError(
    message || `Operation failed${errorKey ? `: ${errorKey}` : ''}`,
    {
      code: ErrorCode.GALACHAIN_ERROR,
      errorKey,
      errorPayload,
    }
  );
}

/**
 * Parse any error into an appropriate AppError type
 */
export function parseError(error: unknown): AppError {
  // Already an AppError
  if (isAppError(error)) {
    return error;
  }

  if (error instanceof Error) {
    const message = error.message.toLowerCase();

    // Check if it's a wallet error
    if (
      message.includes('wallet') ||
      message.includes('metamask') ||
      message.includes('rejected') ||
      message.includes('user denied') ||
      message.includes('provider')
    ) {
      return parseWalletError(error);
    }

    // Check if it's a network error
    if (
      message.includes('network') ||
      message.includes('fetch') ||
      message.includes('timeout') ||
      message.includes('connection')
    ) {
      return parseNetworkError(error);
    }
  }

  // Default to generic error
  return new AppError({
    message: getErrorMessage(error),
    code: ErrorCode.UNKNOWN_ERROR,
    severity: ErrorSeverity.Error,
    recoverable: true,
    originalError: error,
  });
}

/**
 * Log an error in development mode
 */
export function logError(context: string, error: unknown): void {
  if (import.meta.env.DEV) {
    const parsed = isAppError(error) ? error : parseError(error);

    console.group(`[Error:${context}]`);
    console.error('Message:', parsed.message);
    console.error('Code:', parsed.code, `(${ErrorCode[parsed.code]})`);
    console.error('Severity:', parsed.severity);
    console.error('Recoverable:', parsed.recoverable);

    if (parsed.action) {
      console.error('Action:', parsed.action);
    }

    if (parsed instanceof GalaChainError) {
      if (parsed.errorKey) console.error('Error Key:', parsed.errorKey);
      if (parsed.errorPayload) console.error('Payload:', parsed.errorPayload);
    }

    if (parsed.originalError) {
      console.error('Original Error:', parsed.originalError);
    }

    console.groupEnd();
  }
}

/**
 * Get display information for an error
 */
export interface ErrorDisplayInfo {
  message: string;
  action?: string;
  severity: ErrorSeverity;
  recoverable: boolean;
  code: ErrorCode;
}

/**
 * Get user-friendly display information for an error
 */
export function getErrorDisplayInfo(error: unknown): ErrorDisplayInfo {
  const parsed = isAppError(error) ? error : parseError(error);

  return {
    message: parsed.message,
    action: parsed.action,
    severity: parsed.severity,
    recoverable: parsed.recoverable,
    code: parsed.code,
  };
}

// Re-export error types and utilities from shared
export {
  AppError,
  GalaChainError,
  WalletError,
  NetworkError,
  ValidationError,
  ErrorCode,
  ErrorSeverity,
  isAppError,
  getErrorMessage,
  getErrorAction,
};
