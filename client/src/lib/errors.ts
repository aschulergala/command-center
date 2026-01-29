/**
 * Parse SDK/wallet errors into user-friendly messages.
 */
export function parseError(error: unknown): string {
  if (error instanceof Error) {
    const msg = error.message;

    // Wallet errors
    if (msg.includes('User rejected') || msg.includes('user rejected')) {
      return 'Transaction was rejected in your wallet.';
    }
    if (msg.includes('not connected') || msg.includes('NOT_CONNECTED')) {
      return 'Wallet is not connected. Please connect your wallet.';
    }
    if (msg.includes('insufficient') || msg.includes('Insufficient')) {
      return 'Insufficient balance for this operation.';
    }

    // Network errors
    if (msg.includes('timeout') || msg.includes('TIMEOUT')) {
      return 'Request timed out. Please try again.';
    }
    if (msg.includes('network') || msg.includes('NETWORK')) {
      return 'Network error. Please check your connection.';
    }

    return msg;
  }

  if (typeof error === 'string') {
    return error;
  }

  return 'An unexpected error occurred.';
}
