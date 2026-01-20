import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import {
  useTransactionsStore,
  TransactionType,
  TransactionStatus,
  getExplorerUrl,
  getTransactionTypeLabel,
  getTransactionStatusLabel,
} from '../../src/stores/transactions';
import { useToastsStore } from '../../src/stores/toasts';

describe('transactions store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  describe('initial state', () => {
    it('should have empty pendingTxs array', () => {
      const store = useTransactionsStore();
      expect(store.pendingTxs).toEqual([]);
    });

    it('should have empty recentTxs array', () => {
      const store = useTransactionsStore();
      expect(store.recentTxs).toEqual([]);
    });

    it('should have hasPendingTxs return false', () => {
      const store = useTransactionsStore();
      expect(store.hasPendingTxs).toBe(false);
    });

    it('should have pendingCount return 0', () => {
      const store = useTransactionsStore();
      expect(store.pendingCount).toBe(0);
    });

    it('should have hasRecentTxs return false', () => {
      const store = useTransactionsStore();
      expect(store.hasRecentTxs).toBe(false);
    });

    it('should have recentCount return 0', () => {
      const store = useTransactionsStore();
      expect(store.recentCount).toBe(0);
    });
  });

  describe('addPending', () => {
    it('should add a pending transaction with generated id', () => {
      const store = useTransactionsStore();
      const { txId } = store.addPending(TransactionType.Transfer, 'Transferring tokens');

      expect(txId).toMatch(/^tx-\d+-[a-z0-9]+$/);
      expect(store.pendingTxs.length).toBe(1);
      expect(store.pendingTxs[0].id).toBe(txId);
    });

    it('should set correct type and description', () => {
      const store = useTransactionsStore();
      store.addPending(TransactionType.Mint, 'Minting 100 tokens');

      expect(store.pendingTxs[0].type).toBe(TransactionType.Mint);
      expect(store.pendingTxs[0].description).toBe('Minting 100 tokens');
    });

    it('should set status to Pending', () => {
      const store = useTransactionsStore();
      store.addPending(TransactionType.Transfer, 'Test');

      expect(store.pendingTxs[0].status).toBe(TransactionStatus.Pending);
    });

    it('should set timestamp', () => {
      const store = useTransactionsStore();
      const before = Date.now();
      store.addPending(TransactionType.Transfer, 'Test');
      const after = Date.now();

      expect(store.pendingTxs[0].timestamp).toBeGreaterThanOrEqual(before);
      expect(store.pendingTxs[0].timestamp).toBeLessThanOrEqual(after);
    });

    it('should return toast ID', () => {
      const store = useTransactionsStore();
      const { toastId } = store.addPending(TransactionType.Transfer, 'Test');

      expect(toastId).toMatch(/^toast-\d+-[a-z0-9]+$/);
    });

    it('should create toast in toasts store', () => {
      const txStore = useTransactionsStore();
      const toastsStore = useToastsStore();

      txStore.addPending(TransactionType.Transfer, 'Test');

      expect(toastsStore.toasts.length).toBe(1);
      expect(toastsStore.toasts[0].type).toBe('pending');
    });

    it('should update getters', () => {
      const store = useTransactionsStore();
      store.addPending(TransactionType.Transfer, 'Test');

      expect(store.hasPendingTxs).toBe(true);
      expect(store.pendingCount).toBe(1);
    });

    it('should add multiple pending transactions', () => {
      const store = useTransactionsStore();
      store.addPending(TransactionType.Transfer, 'First');
      store.addPending(TransactionType.Mint, 'Second');
      store.addPending(TransactionType.Burn, 'Third');

      expect(store.pendingTxs.length).toBe(3);
      expect(store.pendingCount).toBe(3);
    });
  });

  describe('updateStatus', () => {
    it('should update transaction status', () => {
      const store = useTransactionsStore();
      const { txId } = store.addPending(TransactionType.Transfer, 'Test');

      const result = store.updateStatus(txId, TransactionStatus.Confirming);

      expect(result).toBe(true);
      expect(store.pendingTxs[0].status).toBe(TransactionStatus.Confirming);
    });

    it('should update transaction hash', () => {
      const store = useTransactionsStore();
      const { txId } = store.addPending(TransactionType.Transfer, 'Test');

      store.updateStatus(txId, TransactionStatus.Confirming, 'abc123hash');

      expect(store.pendingTxs[0].hash).toBe('abc123hash');
    });

    it('should return false for non-existent transaction', () => {
      const store = useTransactionsStore();
      const result = store.updateStatus('non-existent', TransactionStatus.Confirming);

      expect(result).toBe(false);
    });
  });

  describe('markComplete', () => {
    it('should move transaction from pending to recent', () => {
      const store = useTransactionsStore();
      const { txId, toastId } = store.addPending(TransactionType.Transfer, 'Test');

      store.markComplete(txId, toastId);

      expect(store.pendingTxs.length).toBe(0);
      expect(store.recentTxs.length).toBe(1);
    });

    it('should set status to Confirmed', () => {
      const store = useTransactionsStore();
      const { txId, toastId } = store.addPending(TransactionType.Transfer, 'Test');

      store.markComplete(txId, toastId);

      expect(store.recentTxs[0].status).toBe(TransactionStatus.Confirmed);
    });

    it('should set hash if provided', () => {
      const store = useTransactionsStore();
      const { txId, toastId } = store.addPending(TransactionType.Transfer, 'Test');

      store.markComplete(txId, toastId, 'txhash123');

      expect(store.recentTxs[0].hash).toBe('txhash123');
    });

    it('should update toast to success', () => {
      const txStore = useTransactionsStore();
      const toastsStore = useToastsStore();
      const { txId, toastId } = txStore.addPending(TransactionType.Transfer, 'Test');

      txStore.markComplete(txId, toastId);

      expect(toastsStore.toasts[0].type).toBe('success');
    });

    it('should add transaction to beginning of recent', () => {
      const store = useTransactionsStore();
      const { txId: id1, toastId: tid1 } = store.addPending(TransactionType.Transfer, 'First');
      const { txId: id2, toastId: tid2 } = store.addPending(TransactionType.Mint, 'Second');

      store.markComplete(id1, tid1);
      store.markComplete(id2, tid2);

      expect(store.recentTxs[0].description).toBe('Second');
      expect(store.recentTxs[1].description).toBe('First');
    });

    it('should limit recent transactions to 10', () => {
      const store = useTransactionsStore();

      // Add 12 transactions and complete them
      for (let i = 0; i < 12; i++) {
        const { txId, toastId } = store.addPending(TransactionType.Transfer, `Transaction ${i}`);
        store.markComplete(txId, toastId);
      }

      expect(store.recentTxs.length).toBe(10);
      // Most recent should be first
      expect(store.recentTxs[0].description).toBe('Transaction 11');
    });

    it('should return false for non-existent transaction', () => {
      const store = useTransactionsStore();
      const result = store.markComplete('non-existent', 'toast-id');

      expect(result).toBe(false);
    });
  });

  describe('markFailed', () => {
    it('should move transaction from pending to recent', () => {
      const store = useTransactionsStore();
      const { txId, toastId } = store.addPending(TransactionType.Transfer, 'Test');

      store.markFailed(txId, toastId, 'User rejected');

      expect(store.pendingTxs.length).toBe(0);
      expect(store.recentTxs.length).toBe(1);
    });

    it('should set status to Failed', () => {
      const store = useTransactionsStore();
      const { txId, toastId } = store.addPending(TransactionType.Transfer, 'Test');

      store.markFailed(txId, toastId, 'User rejected');

      expect(store.recentTxs[0].status).toBe(TransactionStatus.Failed);
    });

    it('should set error message', () => {
      const store = useTransactionsStore();
      const { txId, toastId } = store.addPending(TransactionType.Transfer, 'Test');

      store.markFailed(txId, toastId, 'Insufficient balance');

      expect(store.recentTxs[0].error).toBe('Insufficient balance');
    });

    it('should update toast to error', () => {
      const txStore = useTransactionsStore();
      const toastsStore = useToastsStore();
      const { txId, toastId } = txStore.addPending(TransactionType.Transfer, 'Test');

      txStore.markFailed(txId, toastId, 'Error message');

      expect(toastsStore.toasts[0].type).toBe('error');
    });

    it('should return false for non-existent transaction', () => {
      const store = useTransactionsStore();
      const result = store.markFailed('non-existent', 'toast-id', 'Error');

      expect(result).toBe(false);
    });
  });

  describe('getPendingById', () => {
    it('should return pending transaction when it exists', () => {
      const store = useTransactionsStore();
      const { txId } = store.addPending(TransactionType.Transfer, 'Test');

      const tx = store.getPendingById(txId);

      expect(tx).toBeDefined();
      expect(tx?.id).toBe(txId);
    });

    it('should return undefined for non-existent id', () => {
      const store = useTransactionsStore();
      const tx = store.getPendingById('non-existent');

      expect(tx).toBeUndefined();
    });
  });

  describe('getRecentById', () => {
    it('should return recent transaction when it exists', () => {
      const store = useTransactionsStore();
      const { txId, toastId } = store.addPending(TransactionType.Transfer, 'Test');
      store.markComplete(txId, toastId);

      const tx = store.getRecentById(txId);

      expect(tx).toBeDefined();
      expect(tx?.id).toBe(txId);
    });

    it('should return undefined for non-existent id', () => {
      const store = useTransactionsStore();
      const tx = store.getRecentById('non-existent');

      expect(tx).toBeUndefined();
    });
  });

  describe('clear methods', () => {
    it('clearRecent should remove all recent transactions', () => {
      const store = useTransactionsStore();
      const { txId, toastId } = store.addPending(TransactionType.Transfer, 'Test');
      store.markComplete(txId, toastId);

      store.clearRecent();

      expect(store.recentTxs.length).toBe(0);
      expect(store.hasRecentTxs).toBe(false);
    });

    it('clearPending should remove all pending transactions', () => {
      const store = useTransactionsStore();
      store.addPending(TransactionType.Transfer, 'Test 1');
      store.addPending(TransactionType.Transfer, 'Test 2');

      store.clearPending();

      expect(store.pendingTxs.length).toBe(0);
      expect(store.hasPendingTxs).toBe(false);
    });

    it('clearAll should remove all transactions', () => {
      const store = useTransactionsStore();
      store.addPending(TransactionType.Transfer, 'Pending');
      const { txId, toastId } = store.addPending(TransactionType.Transfer, 'To Complete');
      store.markComplete(txId, toastId);

      store.clearAll();

      expect(store.pendingTxs.length).toBe(0);
      expect(store.recentTxs.length).toBe(0);
    });
  });
});

describe('utility functions', () => {
  describe('getExplorerUrl', () => {
    it('should return correct explorer URL', () => {
      const url = getExplorerUrl('abc123');
      expect(url).toBe('https://explorer.galachain.com/tx/abc123');
    });
  });

  describe('getTransactionTypeLabel', () => {
    it('should return correct label for Transfer', () => {
      expect(getTransactionTypeLabel(TransactionType.Transfer)).toBe('Transfer');
    });

    it('should return correct label for Mint', () => {
      expect(getTransactionTypeLabel(TransactionType.Mint)).toBe('Mint');
    });

    it('should return correct label for Burn', () => {
      expect(getTransactionTypeLabel(TransactionType.Burn)).toBe('Burn');
    });

    it('should return correct label for CreateCollection', () => {
      expect(getTransactionTypeLabel(TransactionType.CreateCollection)).toBe('Create Collection');
    });

    it('should return correct label for CreateClass', () => {
      expect(getTransactionTypeLabel(TransactionType.CreateClass)).toBe('Create Class');
    });

    it('should return correct label for GrantAllowance', () => {
      expect(getTransactionTypeLabel(TransactionType.GrantAllowance)).toBe('Grant Allowance');
    });

    it('should return correct label for RevokeAllowance', () => {
      expect(getTransactionTypeLabel(TransactionType.RevokeAllowance)).toBe('Revoke Allowance');
    });

    it('should return correct label for Lock', () => {
      expect(getTransactionTypeLabel(TransactionType.Lock)).toBe('Lock');
    });

    it('should return correct label for Unlock', () => {
      expect(getTransactionTypeLabel(TransactionType.Unlock)).toBe('Unlock');
    });
  });

  describe('getTransactionStatusLabel', () => {
    it('should return correct label for Pending', () => {
      expect(getTransactionStatusLabel(TransactionStatus.Pending)).toBe('Pending');
    });

    it('should return correct label for Confirming', () => {
      expect(getTransactionStatusLabel(TransactionStatus.Confirming)).toBe('Confirming');
    });

    it('should return correct label for Confirmed', () => {
      expect(getTransactionStatusLabel(TransactionStatus.Confirmed)).toBe('Confirmed');
    });

    it('should return correct label for Failed', () => {
      expect(getTransactionStatusLabel(TransactionStatus.Failed)).toBe('Failed');
    });
  });
});
