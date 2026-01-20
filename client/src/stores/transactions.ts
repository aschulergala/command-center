import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { TransactionType, TransactionStatus, type PendingTransaction } from '@shared/types/display';
import { useToastsStore } from './toasts';

// Re-export types for convenience
export { TransactionType, TransactionStatus };
export type { PendingTransaction };

// Maximum number of recent transactions to keep
const MAX_RECENT_TRANSACTIONS = 10;

// GalaChain explorer base URL
const GALACHAIN_EXPLORER_URL = 'https://explorer.galachain.com/tx';

// Generate unique transaction ID
function generateId(): string {
  return `tx-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Get the GalaChain explorer URL for a transaction hash
 */
export function getExplorerUrl(hash: string): string {
  return `${GALACHAIN_EXPLORER_URL}/${hash}`;
}

/**
 * Get a human-readable label for a transaction type
 */
export function getTransactionTypeLabel(type: TransactionType): string {
  const labels: Record<TransactionType, string> = {
    [TransactionType.Transfer]: 'Transfer',
    [TransactionType.Mint]: 'Mint',
    [TransactionType.Burn]: 'Burn',
    [TransactionType.CreateCollection]: 'Create Collection',
    [TransactionType.CreateClass]: 'Create Class',
    [TransactionType.GrantAllowance]: 'Grant Allowance',
    [TransactionType.RevokeAllowance]: 'Revoke Allowance',
    [TransactionType.Lock]: 'Lock',
    [TransactionType.Unlock]: 'Unlock',
  };
  return labels[type] || type;
}

/**
 * Get a human-readable label for a transaction status
 */
export function getTransactionStatusLabel(status: TransactionStatus): string {
  const labels: Record<TransactionStatus, string> = {
    [TransactionStatus.Pending]: 'Pending',
    [TransactionStatus.Confirming]: 'Confirming',
    [TransactionStatus.Confirmed]: 'Confirmed',
    [TransactionStatus.Failed]: 'Failed',
  };
  return labels[status] || status;
}

export const useTransactionsStore = defineStore('transactions', () => {
  // State
  const pendingTxs = ref<PendingTransaction[]>([]);
  const recentTxs = ref<PendingTransaction[]>([]);

  // Getters
  const hasPendingTxs = computed(() => pendingTxs.value.length > 0);
  const pendingCount = computed(() => pendingTxs.value.length);
  const hasRecentTxs = computed(() => recentTxs.value.length > 0);
  const recentCount = computed(() => recentTxs.value.length);

  /**
   * Add a new pending transaction
   * Returns the transaction ID and a toast ID for updates
   */
  function addPending(type: TransactionType, description: string): { txId: string; toastId: string } {
    const toastsStore = useToastsStore();
    const txId = generateId();

    const transaction: PendingTransaction = {
      id: txId,
      type,
      status: TransactionStatus.Pending,
      timestamp: Date.now(),
      description,
    };

    pendingTxs.value.push(transaction);

    // Show pending toast
    const toastId = toastsStore.pending(description, getTransactionTypeLabel(type));

    return { txId, toastId };
  }

  /**
   * Update the status of a pending transaction
   */
  function updateStatus(txId: string, status: TransactionStatus, hash?: string): boolean {
    const tx = pendingTxs.value.find(t => t.id === txId);
    if (tx) {
      tx.status = status;
      if (hash) {
        tx.hash = hash;
      }
      return true;
    }
    return false;
  }

  /**
   * Mark a transaction as complete (confirmed)
   * Moves it from pending to recent transactions
   */
  function markComplete(txId: string, toastId: string, hash?: string, successMessage?: string): boolean {
    const toastsStore = useToastsStore();
    const txIndex = pendingTxs.value.findIndex(t => t.id === txId);

    if (txIndex === -1) {
      return false;
    }

    const tx = pendingTxs.value[txIndex];
    tx.status = TransactionStatus.Confirmed;
    if (hash) {
      tx.hash = hash;
    }

    // Remove from pending
    pendingTxs.value.splice(txIndex, 1);

    // Add to recent (at the beginning)
    recentTxs.value.unshift(tx);

    // Keep only the last MAX_RECENT_TRANSACTIONS
    if (recentTxs.value.length > MAX_RECENT_TRANSACTIONS) {
      recentTxs.value.pop();
    }

    // Update toast to success
    const message = successMessage || tx.description;
    toastsStore.updateToast(toastId, {
      type: 'success',
      message: hash ? `${message} View on explorer.` : message,
      title: 'Transaction Complete',
      dismissible: true,
      duration: 5000,
    });

    return true;
  }

  /**
   * Mark a transaction as failed
   * Moves it from pending to recent transactions
   */
  function markFailed(txId: string, toastId: string, error: string): boolean {
    const toastsStore = useToastsStore();
    const txIndex = pendingTxs.value.findIndex(t => t.id === txId);

    if (txIndex === -1) {
      return false;
    }

    const tx = pendingTxs.value[txIndex];
    tx.status = TransactionStatus.Failed;
    tx.error = error;

    // Remove from pending
    pendingTxs.value.splice(txIndex, 1);

    // Add to recent (at the beginning)
    recentTxs.value.unshift(tx);

    // Keep only the last MAX_RECENT_TRANSACTIONS
    if (recentTxs.value.length > MAX_RECENT_TRANSACTIONS) {
      recentTxs.value.pop();
    }

    // Update toast to error
    toastsStore.updateToast(toastId, {
      type: 'error',
      message: error,
      title: 'Transaction Failed',
      dismissible: true,
    });

    return true;
  }

  /**
   * Get a pending transaction by ID
   */
  function getPendingById(txId: string): PendingTransaction | undefined {
    return pendingTxs.value.find(t => t.id === txId);
  }

  /**
   * Get a recent transaction by ID
   */
  function getRecentById(txId: string): PendingTransaction | undefined {
    return recentTxs.value.find(t => t.id === txId);
  }

  /**
   * Clear all recent transactions
   */
  function clearRecent(): void {
    recentTxs.value = [];
  }

  /**
   * Clear all pending transactions (use with caution)
   */
  function clearPending(): void {
    pendingTxs.value = [];
  }

  /**
   * Clear all transactions
   */
  function clearAll(): void {
    pendingTxs.value = [];
    recentTxs.value = [];
  }

  return {
    // State
    pendingTxs,
    recentTxs,
    // Getters
    hasPendingTxs,
    pendingCount,
    hasRecentTxs,
    recentCount,
    // Actions
    addPending,
    updateStatus,
    markComplete,
    markFailed,
    getPendingById,
    getRecentById,
    clearRecent,
    clearPending,
    clearAll,
  };
});
