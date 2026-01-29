import { describe, it, expect } from 'vitest';
import { parseError } from '@/lib/errors';

describe('parseError', () => {
  // -----------------------------------------------------------------------
  // Wallet rejection errors
  // -----------------------------------------------------------------------
  describe('wallet rejection', () => {
    it('handles "User rejected the request"', () => {
      expect(parseError(new Error('User rejected the request'))).toBe(
        'Transaction was rejected in your wallet.',
      );
    });

    it('handles "user rejected" (lowercase)', () => {
      expect(parseError(new Error('user rejected'))).toBe(
        'Transaction was rejected in your wallet.',
      );
    });

    it('handles message containing "User rejected" among other text', () => {
      expect(parseError(new Error('MetaMask: User rejected transaction'))).toBe(
        'Transaction was rejected in your wallet.',
      );
    });
  });

  // -----------------------------------------------------------------------
  // Wallet not connected errors
  // -----------------------------------------------------------------------
  describe('wallet not connected', () => {
    it('handles "not connected"', () => {
      expect(parseError(new Error('Wallet is not connected to the network'))).toBe(
        'Wallet is not connected. Please connect your wallet.',
      );
    });

    it('handles "NOT_CONNECTED"', () => {
      expect(parseError(new Error('NOT_CONNECTED'))).toBe(
        'Wallet is not connected. Please connect your wallet.',
      );
    });
  });

  // -----------------------------------------------------------------------
  // Insufficient balance errors
  // -----------------------------------------------------------------------
  describe('insufficient balance', () => {
    it('handles "insufficient funds"', () => {
      expect(parseError(new Error('insufficient funds for gas'))).toBe(
        'Insufficient balance for this operation.',
      );
    });

    it('handles "Insufficient balance" (capitalized)', () => {
      expect(parseError(new Error('Insufficient balance to complete transfer'))).toBe(
        'Insufficient balance for this operation.',
      );
    });

    it('handles "insufficient" anywhere in message', () => {
      expect(parseError(new Error('Transaction failed: insufficient allowance'))).toBe(
        'Insufficient balance for this operation.',
      );
    });
  });

  // -----------------------------------------------------------------------
  // Timeout errors
  // -----------------------------------------------------------------------
  describe('timeout', () => {
    it('handles "timeout"', () => {
      expect(parseError(new Error('Request timeout after 30s'))).toBe(
        'Request timed out. Please try again.',
      );
    });

    it('handles "TIMEOUT"', () => {
      expect(parseError(new Error('TIMEOUT'))).toBe(
        'Request timed out. Please try again.',
      );
    });
  });

  // -----------------------------------------------------------------------
  // Network errors
  // -----------------------------------------------------------------------
  describe('network', () => {
    it('handles "network error"', () => {
      expect(parseError(new Error('network error'))).toBe(
        'Network error. Please check your connection.',
      );
    });

    it('handles "NETWORK"', () => {
      expect(parseError(new Error('NETWORK_ERROR'))).toBe(
        'Network error. Please check your connection.',
      );
    });

    it('handles "network" anywhere in message', () => {
      expect(parseError(new Error('Failed due to network issue'))).toBe(
        'Network error. Please check your connection.',
      );
    });
  });

  // -----------------------------------------------------------------------
  // Custom / unrecognized Error messages pass through
  // -----------------------------------------------------------------------
  describe('custom Error messages', () => {
    it('returns the raw message for an unrecognized Error', () => {
      expect(parseError(new Error('Some custom error'))).toBe('Some custom error');
    });

    it('returns empty string message as-is', () => {
      expect(parseError(new Error(''))).toBe('');
    });

    it('returns complex message as-is when no keyword matches', () => {
      expect(parseError(new Error('Contract reverted: ERC20 transfer amount exceeds balance'))).toBe(
        'Contract reverted: ERC20 transfer amount exceeds balance',
      );
    });
  });

  // -----------------------------------------------------------------------
  // String errors
  // -----------------------------------------------------------------------
  describe('string errors', () => {
    it('returns the string as-is', () => {
      expect(parseError('Something went wrong')).toBe('Something went wrong');
    });

    it('returns empty string as-is', () => {
      expect(parseError('')).toBe('');
    });
  });

  // -----------------------------------------------------------------------
  // Non-Error, non-string values
  // -----------------------------------------------------------------------
  describe('non-Error, non-string values', () => {
    it('returns fallback for null', () => {
      expect(parseError(null)).toBe('An unexpected error occurred.');
    });

    it('returns fallback for undefined', () => {
      expect(parseError(undefined)).toBe('An unexpected error occurred.');
    });

    it('returns fallback for a number', () => {
      expect(parseError(42)).toBe('An unexpected error occurred.');
    });

    it('returns fallback for a plain object', () => {
      expect(parseError({ message: 'not an Error instance' })).toBe(
        'An unexpected error occurred.',
      );
    });

    it('returns fallback for an array', () => {
      expect(parseError(['error'])).toBe('An unexpected error occurred.');
    });

    it('returns fallback for boolean', () => {
      expect(parseError(false)).toBe('An unexpected error occurred.');
    });
  });

  // -----------------------------------------------------------------------
  // Priority / ordering checks
  // -----------------------------------------------------------------------
  describe('keyword priority', () => {
    it('matches "User rejected" before "network" when both present', () => {
      expect(parseError(new Error('User rejected on network'))).toBe(
        'Transaction was rejected in your wallet.',
      );
    });

    it('matches "not connected" before "timeout" when both present', () => {
      expect(parseError(new Error('not connected, timeout'))).toBe(
        'Wallet is not connected. Please connect your wallet.',
      );
    });

    it('matches "insufficient" before "network" when both present', () => {
      expect(parseError(new Error('insufficient gas, network retry'))).toBe(
        'Insufficient balance for this operation.',
      );
    });

    it('matches "timeout" before "network" when both present', () => {
      expect(parseError(new Error('timeout on network call'))).toBe(
        'Request timed out. Please try again.',
      );
    });
  });
});
