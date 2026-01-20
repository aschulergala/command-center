import {
  AppError,
  GalaChainError,
  WalletError,
  NetworkError,
  ValidationError,
  ErrorCode,
  ErrorSeverity,
  isAppError,
  isGalaChainError,
  isWalletError,
  isNetworkError,
  isValidationError,
  getErrorMessage,
  getErrorAction,
  wrapError,
} from '../errors';

describe('shared/errors', () => {
  describe('AppError', () => {
    it('should create error with default values', () => {
      const error = new AppError({ message: 'Test error' });

      expect(error.message).toBe('Test error');
      expect(error.code).toBe(ErrorCode.UNKNOWN_ERROR);
      expect(error.severity).toBe(ErrorSeverity.Error);
      expect(error.recoverable).toBe(false);
      expect(error.name).toBe('AppError');
      expect(error.timestamp).toBeDefined();
    });

    it('should create error with custom values', () => {
      const error = new AppError({
        message: 'Custom error',
        code: ErrorCode.VALIDATION_ERROR,
        severity: ErrorSeverity.Warning,
        recoverable: true,
        action: 'Fix your input',
        details: 'Technical details',
      });

      expect(error.message).toBe('Custom error');
      expect(error.code).toBe(ErrorCode.VALIDATION_ERROR);
      expect(error.severity).toBe(ErrorSeverity.Warning);
      expect(error.recoverable).toBe(true);
      expect(error.action).toBe('Fix your input');
      expect(error.details).toBe('Technical details');
    });

    it('should convert to JSON', () => {
      const error = new AppError({
        message: 'Test error',
        code: ErrorCode.NETWORK_ERROR,
        action: 'Try again',
      });

      const json = error.toJSON();

      expect(json.message).toBe('Test error');
      expect(json.code).toBe(ErrorCode.NETWORK_ERROR);
      expect(json.action).toBe('Try again');
      expect(json.timestamp).toBeDefined();
    });
  });

  describe('GalaChainError', () => {
    it('should create GalaChain error', () => {
      const error = new GalaChainError('Insufficient balance', {
        code: ErrorCode.INSUFFICIENT_BALANCE,
        errorKey: 'INSUFFICIENT_BALANCE',
        errorPayload: { required: 100, available: 50 },
      });

      expect(error.message).toBe('Insufficient balance');
      expect(error.code).toBe(ErrorCode.INSUFFICIENT_BALANCE);
      expect(error.errorKey).toBe('INSUFFICIENT_BALANCE');
      expect(error.errorPayload).toEqual({ required: 100, available: 50 });
      expect(error.name).toBe('GalaChainError');
      expect(error.recoverable).toBe(true);
    });

    it('should default to GALACHAIN_ERROR code', () => {
      const error = new GalaChainError('Generic error');

      expect(error.code).toBe(ErrorCode.GALACHAIN_ERROR);
    });
  });

  describe('WalletError', () => {
    it('should create wallet error', () => {
      const error = new WalletError('Transaction rejected', {
        code: ErrorCode.TRANSACTION_REJECTED,
        action: 'Approve the transaction',
      });

      expect(error.message).toBe('Transaction rejected');
      expect(error.code).toBe(ErrorCode.TRANSACTION_REJECTED);
      expect(error.action).toBe('Approve the transaction');
      expect(error.name).toBe('WalletError');
    });

    it('should default to WALLET_ERROR code', () => {
      const error = new WalletError('Unknown wallet error');

      expect(error.code).toBe(ErrorCode.WALLET_ERROR);
    });
  });

  describe('NetworkError', () => {
    it('should create network error', () => {
      const error = new NetworkError('Connection failed', {
        code: ErrorCode.CONNECTION_FAILED,
        statusCode: 503,
      });

      expect(error.message).toBe('Connection failed');
      expect(error.code).toBe(ErrorCode.CONNECTION_FAILED);
      expect(error.statusCode).toBe(503);
      expect(error.name).toBe('NetworkError');
    });

    it('should default to NETWORK_ERROR code', () => {
      const error = new NetworkError('Network issue');

      expect(error.code).toBe(ErrorCode.NETWORK_ERROR);
    });
  });

  describe('ValidationError', () => {
    it('should create validation error', () => {
      const error = new ValidationError('Invalid amount', {
        code: ErrorCode.INVALID_AMOUNT,
        field: 'amount',
      });

      expect(error.message).toBe('Invalid amount');
      expect(error.code).toBe(ErrorCode.INVALID_AMOUNT);
      expect(error.field).toBe('amount');
      expect(error.name).toBe('ValidationError');
      expect(error.severity).toBe(ErrorSeverity.Warning);
    });

    it('should default to VALIDATION_ERROR code', () => {
      const error = new ValidationError('Invalid input');

      expect(error.code).toBe(ErrorCode.VALIDATION_ERROR);
    });
  });

  describe('Type guards', () => {
    it('isAppError should return true for AppError', () => {
      expect(isAppError(new AppError({ message: 'test' }))).toBe(true);
      expect(isAppError(new GalaChainError('test'))).toBe(true);
      expect(isAppError(new WalletError('test'))).toBe(true);
      expect(isAppError(new NetworkError('test'))).toBe(true);
      expect(isAppError(new ValidationError('test'))).toBe(true);
    });

    it('isAppError should return false for non-AppError', () => {
      expect(isAppError(new Error('test'))).toBe(false);
      expect(isAppError('test')).toBe(false);
      expect(isAppError(null)).toBe(false);
      expect(isAppError(undefined)).toBe(false);
    });

    it('isGalaChainError should return true only for GalaChainError', () => {
      expect(isGalaChainError(new GalaChainError('test'))).toBe(true);
      expect(isGalaChainError(new AppError({ message: 'test' }))).toBe(false);
      expect(isGalaChainError(new Error('test'))).toBe(false);
    });

    it('isWalletError should return true only for WalletError', () => {
      expect(isWalletError(new WalletError('test'))).toBe(true);
      expect(isWalletError(new AppError({ message: 'test' }))).toBe(false);
      expect(isWalletError(new Error('test'))).toBe(false);
    });

    it('isNetworkError should return true only for NetworkError', () => {
      expect(isNetworkError(new NetworkError('test'))).toBe(true);
      expect(isNetworkError(new AppError({ message: 'test' }))).toBe(false);
      expect(isNetworkError(new Error('test'))).toBe(false);
    });

    it('isValidationError should return true only for ValidationError', () => {
      expect(isValidationError(new ValidationError('test'))).toBe(true);
      expect(isValidationError(new AppError({ message: 'test' }))).toBe(false);
      expect(isValidationError(new Error('test'))).toBe(false);
    });
  });

  describe('getErrorMessage', () => {
    it('should get message from AppError', () => {
      const error = new AppError({ message: 'App error message' });
      expect(getErrorMessage(error)).toBe('App error message');
    });

    it('should get message from Error', () => {
      const error = new Error('Standard error message');
      expect(getErrorMessage(error)).toBe('Standard error message');
    });

    it('should return string directly', () => {
      expect(getErrorMessage('String error')).toBe('String error');
    });

    it('should return default message for unknown types', () => {
      expect(getErrorMessage(null)).toBe('An unexpected error occurred. Please try again.');
      expect(getErrorMessage(undefined)).toBe('An unexpected error occurred. Please try again.');
      expect(getErrorMessage(123)).toBe('An unexpected error occurred. Please try again.');
    });
  });

  describe('getErrorAction', () => {
    it('should get action from AppError', () => {
      const error = new AppError({
        message: 'Test',
        action: 'Try again later',
      });
      expect(getErrorAction(error)).toBe('Try again later');
    });

    it('should return undefined for non-AppError', () => {
      expect(getErrorAction(new Error('test'))).toBeUndefined();
      expect(getErrorAction('string')).toBeUndefined();
    });
  });

  describe('wrapError', () => {
    it('should return AppError unchanged', () => {
      const error = new AppError({ message: 'Original' });
      const wrapped = wrapError(error);

      expect(wrapped).toBe(error);
    });

    it('should wrap Error in AppError', () => {
      const error = new Error('Original error');
      const wrapped = wrapError(error);

      expect(wrapped).toBeInstanceOf(AppError);
      expect(wrapped.message).toBe('Original error');
      expect(wrapped.originalError).toBe(error);
    });

    it('should wrap string in AppError', () => {
      const wrapped = wrapError('String error');

      expect(wrapped).toBeInstanceOf(AppError);
      expect(wrapped.message).toBe('String error');
    });

    it('should use fallback message for unknown types', () => {
      const wrapped = wrapError(null, 'Default message');

      expect(wrapped).toBeInstanceOf(AppError);
      // When error is null, getErrorMessage returns the default error message
      // The defaultMessage is only used if getErrorMessage returns empty/undefined
      expect(wrapped.message).toBe('An unexpected error occurred. Please try again.');
    });

    it('should use default message when error string is empty', () => {
      const wrapped = wrapError('', 'Default message');

      expect(wrapped).toBeInstanceOf(AppError);
      // Empty string should use default message
      expect(wrapped.message).toBe('Default message');
    });
  });

  describe('ErrorCode enum', () => {
    it('should have correct GalaChain error codes (1xxx)', () => {
      expect(ErrorCode.GALACHAIN_ERROR).toBe(1000);
      expect(ErrorCode.INSUFFICIENT_BALANCE).toBe(1001);
      expect(ErrorCode.UNAUTHORIZED).toBe(1002);
    });

    it('should have correct wallet error codes (2xxx)', () => {
      expect(ErrorCode.WALLET_ERROR).toBe(2000);
      expect(ErrorCode.WALLET_NOT_CONNECTED).toBe(2001);
      expect(ErrorCode.TRANSACTION_REJECTED).toBe(2005);
    });

    it('should have correct network error codes (3xxx)', () => {
      expect(ErrorCode.NETWORK_ERROR).toBe(3000);
      expect(ErrorCode.TIMEOUT).toBe(3001);
    });

    it('should have correct validation error codes (4xxx)', () => {
      expect(ErrorCode.VALIDATION_ERROR).toBe(4000);
      expect(ErrorCode.INVALID_ADDRESS).toBe(4001);
    });

    it('should have correct generic error codes (9xxx)', () => {
      expect(ErrorCode.UNKNOWN_ERROR).toBe(9000);
      expect(ErrorCode.INTERNAL_ERROR).toBe(9001);
    });
  });

  describe('ErrorSeverity enum', () => {
    it('should have all severity levels', () => {
      expect(ErrorSeverity.Info).toBe('info');
      expect(ErrorSeverity.Warning).toBe('warning');
      expect(ErrorSeverity.Error).toBe('error');
      expect(ErrorSeverity.Critical).toBe('critical');
    });
  });
});
