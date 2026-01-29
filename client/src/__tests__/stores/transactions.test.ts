import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useTransactionStore } from '@/stores/transactions';
import type { TxType } from '@/stores/transactions';

describe('useTransactionStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  describe('addPending()', () => {
    it('creates a transaction with pending status and returns an id', () => {
      const store = useTransactionStore();
      const id = store.addPending('transfer', 'Send GALA');

      expect(id).toMatch(/^tx-\d+$/);
      expect(store.transactions).toHaveLength(1);
      expect(store.transactions[0]).toMatchObject({
        id,
        type: 'transfer',
        label: 'Send GALA',
        status: 'pending',
      });
    });

    it('adds new transactions at the beginning of the array (unshift)', () => {
      const store = useTransactionStore();
      const id1 = store.addPending('transfer', 'First');
      const id2 = store.addPending('burn', 'Second');

      expect(store.transactions[0].id).toBe(id2);
      expect(store.transactions[1].id).toBe(id1);
    });

    it('assigns incrementing ids', () => {
      const store = useTransactionStore();
      const id1 = store.addPending('transfer', 'A');
      const id2 = store.addPending('mint', 'B');

      const num1 = parseInt(id1.replace('tx-', ''));
      const num2 = parseInt(id2.replace('tx-', ''));
      expect(num2).toBe(num1 + 1);
    });

    it('sets a timestamp on the transaction', () => {
      const now = 1700000000000;
      vi.spyOn(Date, 'now').mockReturnValue(now);

      const store = useTransactionStore();
      store.addPending('lock', 'Lock tokens');

      expect(store.transactions[0].timestamp).toBe(now);

      vi.restoreAllMocks();
    });
  });

  describe('pendingCount and hasPending', () => {
    it('returns 0 when no transactions exist', () => {
      const store = useTransactionStore();
      expect(store.pendingCount).toBe(0);
      expect(store.hasPending).toBe(false);
    });

    it('counts only pending transactions', () => {
      const store = useTransactionStore();
      const id1 = store.addPending('transfer', 'A');
      store.addPending('burn', 'B');
      store.addPending('mint', 'C');

      store.markComplete(id1, '0xabc');

      expect(store.pendingCount).toBe(2);
      expect(store.hasPending).toBe(true);
    });

    it('returns false when all transactions are complete or failed', () => {
      const store = useTransactionStore();
      const id1 = store.addPending('transfer', 'A');
      const id2 = store.addPending('burn', 'B');

      store.markComplete(id1);
      store.markFailed(id2, 'error');

      expect(store.pendingCount).toBe(0);
      expect(store.hasPending).toBe(false);
    });
  });

  describe('markComplete()', () => {
    it('updates status to complete', () => {
      const store = useTransactionStore();
      const id = store.addPending('transfer', 'Send');

      store.markComplete(id);

      expect(store.transactions[0].status).toBe('complete');
    });

    it('optionally sets txHash', () => {
      const store = useTransactionStore();
      const id = store.addPending('transfer', 'Send');

      store.markComplete(id, '0xdeadbeef');

      expect(store.transactions[0].txHash).toBe('0xdeadbeef');
    });

    it('leaves txHash undefined when not provided', () => {
      const store = useTransactionStore();
      const id = store.addPending('transfer', 'Send');

      store.markComplete(id);

      expect(store.transactions[0].txHash).toBeUndefined();
    });

    it('does nothing for a non-existent id', () => {
      const store = useTransactionStore();
      store.addPending('transfer', 'Send');

      store.markComplete('tx-nonexistent');

      expect(store.transactions[0].status).toBe('pending');
    });
  });

  describe('markFailed()', () => {
    it('updates status to failed and sets error from Error object', () => {
      const store = useTransactionStore();
      const id = store.addPending('burn', 'Burn tokens');

      store.markFailed(id, new Error('Insufficient balance'));

      expect(store.transactions[0].status).toBe('failed');
      expect(store.transactions[0].error).toBe('Insufficient balance');
    });

    it('sets error from a string', () => {
      const store = useTransactionStore();
      const id = store.addPending('lock', 'Lock');

      store.markFailed(id, 'Something broke');

      expect(store.transactions[0].status).toBe('failed');
      expect(store.transactions[0].error).toBe('Something broke');
    });

    it('converts non-string/non-Error to string', () => {
      const store = useTransactionStore();
      const id = store.addPending('unlock', 'Unlock');

      store.markFailed(id, 42);

      expect(store.transactions[0].error).toBe('42');
    });

    it('does nothing for a non-existent id', () => {
      const store = useTransactionStore();
      store.addPending('transfer', 'A');

      store.markFailed('tx-nonexistent', 'err');

      expect(store.transactions[0].status).toBe('pending');
      expect(store.transactions[0].error).toBeUndefined();
    });
  });

  describe('clear()', () => {
    it('removes completed and failed transactions', () => {
      const store = useTransactionStore();
      const id1 = store.addPending('transfer', 'A');
      const id2 = store.addPending('burn', 'B');
      store.addPending('mint', 'C');

      store.markComplete(id1, '0x1');
      store.markFailed(id2, 'err');

      store.clear();

      expect(store.transactions).toHaveLength(1);
      expect(store.transactions[0].label).toBe('C');
      expect(store.transactions[0].status).toBe('pending');
    });

    it('keeps all pending transactions', () => {
      const store = useTransactionStore();
      store.addPending('transfer', 'A');
      store.addPending('burn', 'B');

      store.clear();

      expect(store.transactions).toHaveLength(2);
    });

    it('results in empty array when no pending transactions exist', () => {
      const store = useTransactionStore();
      const id1 = store.addPending('transfer', 'A');
      const id2 = store.addPending('burn', 'B');

      store.markComplete(id1);
      store.markFailed(id2, 'err');

      store.clear();

      expect(store.transactions).toHaveLength(0);
    });
  });

  describe('multiple transactions', () => {
    it('tracks multiple transactions independently', () => {
      const store = useTransactionStore();
      const id1 = store.addPending('transfer', 'Transfer GALA');
      const id2 = store.addPending('burn', 'Burn tokens');
      const id3 = store.addPending('mint', 'Mint NFT');

      store.markComplete(id1, '0xhash1');
      store.markFailed(id3, new Error('Mint failed'));

      const tx1 = store.transactions.find((t) => t.id === id1)!;
      const tx2 = store.transactions.find((t) => t.id === id2)!;
      const tx3 = store.transactions.find((t) => t.id === id3)!;

      expect(tx1.status).toBe('complete');
      expect(tx1.txHash).toBe('0xhash1');

      expect(tx2.status).toBe('pending');
      expect(tx2.txHash).toBeUndefined();
      expect(tx2.error).toBeUndefined();

      expect(tx3.status).toBe('failed');
      expect(tx3.error).toBe('Mint failed');
    });
  });

  describe('transaction types', () => {
    it.each<TxType>(['transfer', 'burn', 'lock', 'unlock', 'mint', 'claim', 'create'])(
      'accepts type "%s"',
      (txType) => {
        const store = useTransactionStore();
        const id = store.addPending(txType, `${txType} operation`);

        expect(store.transactions.find((t) => t.id === id)?.type).toBe(txType);
      },
    );
  });
});
