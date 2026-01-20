/**
 * Shared error types for GalaChain Command Center
 * Used by both NestJS backend and Vue client
 */

/**
 * Error codes for categorizing errors
 */
export enum ErrorCode {
  // GalaChain errors (1xxx)
  GALACHAIN_ERROR = 1000,
  INSUFFICIENT_BALANCE = 1001,
  UNAUTHORIZED = 1002,
  ALLOWANCE_EXCEEDED = 1003,
  TOKEN_NOT_FOUND = 1004,
  INVALID_SIGNATURE = 1005,
  VALIDATION_FAILED = 1006,
  MAX_SUPPLY_EXCEEDED = 1007,
  TOKENS_LOCKED = 1008,
  TRANSACTION_FAILED = 1009,

  // Wallet errors (2xxx)
  WALLET_ERROR = 2000,
  WALLET_NOT_CONNECTED = 2001,
  WALLET_CONNECTION_REJECTED = 2002,
  WALLET_LOCKED = 2003,
  WALLET_NOT_INSTALLED = 2004,
  TRANSACTION_REJECTED = 2005,
  PENDING_REQUEST = 2006,
  WRONG_NETWORK = 2007,

  // Network errors (3xxx)
  NETWORK_ERROR = 3000,
  TIMEOUT = 3001,
  CONNECTION_FAILED = 3002,
  API_ERROR = 3003,

  // Validation errors (4xxx)
  VALIDATION_ERROR = 4000,
  INVALID_ADDRESS = 4001,
  INVALID_AMOUNT = 4002,
  INVALID_INPUT = 4003,
  REQUIRED_FIELD = 4004,

  // Unknown/generic errors (9xxx)
  UNKNOWN_ERROR = 9000,
  INTERNAL_ERROR = 9001,
}

/**
 * Severity levels for errors
 */
export enum ErrorSeverity {
  /** Informational - can be auto-dismissed */
  Info = 'info',
  /** Warning - user should be aware but can proceed */
  Warning = 'warning',
  /** Error - operation failed, user action needed */
  Error = 'error',
  /** Critical - serious failure, may require page refresh */
  Critical = 'critical',
}

/**
 * Base error interface for all application errors
 */
export interface AppErrorData {
  /** Error code for categorization */
  code: ErrorCode;
  /** User-friendly error message */
  message: string;
  /** Technical details (dev only) */
  details?: string;
  /** Error severity level */
  severity: ErrorSeverity;
  /** Whether the error is recoverable with retry */
  recoverable: boolean;
  /** Suggested action for the user */
  action?: string;
  /** Original error if wrapped */
  originalError?: unknown;
  /** Timestamp when error occurred */
  timestamp: number;
}

/**
 * Base application error class
 */
export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly severity: ErrorSeverity;
  public readonly recoverable: boolean;
  public readonly action?: string;
  public readonly details?: string;
  public readonly originalError?: unknown;
  public readonly timestamp: number;

  constructor(data: Partial<AppErrorData> & { message: string }) {
    super(data.message);
    this.name = 'AppError';
    this.code = data.code ?? ErrorCode.UNKNOWN_ERROR;
    this.severity = data.severity ?? ErrorSeverity.Error;
    this.recoverable = data.recoverable ?? false;
    this.action = data.action;
    this.details = data.details;
    this.originalError = data.originalError;
    this.timestamp = data.timestamp ?? Date.now();
  }

  /**
   * Convert to plain object for serialization
   */
  toJSON(): AppErrorData {
    return {
      code: this.code,
      message: this.message,
      severity: this.severity,
      recoverable: this.recoverable,
      action: this.action,
      details: this.details,
      timestamp: this.timestamp,
    };
  }
}

/**
 * GalaChain-specific error
 */
export class GalaChainError extends AppError {
  public readonly errorKey?: string;
  public readonly errorPayload?: unknown;

  constructor(
    message: string,
    options: {
      code?: ErrorCode;
      errorKey?: string;
      errorPayload?: unknown;
      recoverable?: boolean;
      action?: string;
      originalError?: unknown;
    } = {}
  ) {
    super({
      message,
      code: options.code ?? ErrorCode.GALACHAIN_ERROR,
      severity: ErrorSeverity.Error,
      recoverable: options.recoverable ?? true,
      action: options.action ?? 'Please try again.',
      originalError: options.originalError,
    });
    this.name = 'GalaChainError';
    this.errorKey = options.errorKey;
    this.errorPayload = options.errorPayload;
  }
}

/**
 * Wallet-related error
 */
export class WalletError extends AppError {
  constructor(
    message: string,
    options: {
      code?: ErrorCode;
      recoverable?: boolean;
      action?: string;
      originalError?: unknown;
    } = {}
  ) {
    super({
      message,
      code: options.code ?? ErrorCode.WALLET_ERROR,
      severity: ErrorSeverity.Error,
      recoverable: options.recoverable ?? true,
      action: options.action ?? 'Please check your wallet and try again.',
      originalError: options.originalError,
    });
    this.name = 'WalletError';
  }
}

/**
 * Network/API error
 */
export class NetworkError extends AppError {
  public readonly statusCode?: number;

  constructor(
    message: string,
    options: {
      code?: ErrorCode;
      statusCode?: number;
      recoverable?: boolean;
      action?: string;
      originalError?: unknown;
    } = {}
  ) {
    super({
      message,
      code: options.code ?? ErrorCode.NETWORK_ERROR,
      severity: ErrorSeverity.Error,
      recoverable: options.recoverable ?? true,
      action: options.action ?? 'Please check your connection and try again.',
      originalError: options.originalError,
    });
    this.name = 'NetworkError';
    this.statusCode = options.statusCode;
  }
}

/**
 * Validation error
 */
export class ValidationError extends AppError {
  public readonly field?: string;

  constructor(
    message: string,
    options: {
      code?: ErrorCode;
      field?: string;
      recoverable?: boolean;
      action?: string;
    } = {}
  ) {
    super({
      message,
      code: options.code ?? ErrorCode.VALIDATION_ERROR,
      severity: ErrorSeverity.Warning,
      recoverable: options.recoverable ?? true,
      action: options.action ?? 'Please check your input and try again.',
    });
    this.name = 'ValidationError';
    this.field = options.field;
  }
}

/**
 * Check if an error is an AppError or one of its subclasses
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

/**
 * Check if error is a GalaChainError
 */
export function isGalaChainError(error: unknown): error is GalaChainError {
  return error instanceof GalaChainError;
}

/**
 * Check if error is a WalletError
 */
export function isWalletError(error: unknown): error is WalletError {
  return error instanceof WalletError;
}

/**
 * Check if error is a NetworkError
 */
export function isNetworkError(error: unknown): error is NetworkError {
  return error instanceof NetworkError;
}

/**
 * Check if error is a ValidationError
 */
export function isValidationError(error: unknown): error is ValidationError {
  return error instanceof ValidationError;
}

/**
 * Get a user-friendly message from any error
 */
export function getErrorMessage(error: unknown): string {
  if (isAppError(error)) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  return 'An unexpected error occurred. Please try again.';
}

/**
 * Get the suggested action for an error
 */
export function getErrorAction(error: unknown): string | undefined {
  if (isAppError(error)) {
    return error.action;
  }
  return undefined;
}

/**
 * Wrap any error into an AppError
 */
export function wrapError(error: unknown, defaultMessage?: string): AppError {
  if (isAppError(error)) {
    return error;
  }

  const message = getErrorMessage(error) || defaultMessage || 'An unexpected error occurred';

  return new AppError({
    message,
    code: ErrorCode.UNKNOWN_ERROR,
    severity: ErrorSeverity.Error,
    recoverable: true,
    originalError: error,
  });
}
