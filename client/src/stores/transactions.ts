import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export type TxStatus = 'pending' | 'complete' | 'failed';
export type TxType = 'transfer' | 'burn' | 'lock' | 'unlock' | 'mint' | 'claim' | 'create';

export interface Transaction {
  id: string;
  type: TxType;
  label: string;
  status: TxStatus;
  txHash?: string;
  error?: string;
  timestamp: number;
}

let nextTxId = 0;

export const useTransactionStore = defineStore('transactions', () => {
  const transactions = ref<Transaction[]>([]);

  const pendingCount = computed(() =>
    transactions.value.filter((tx) => tx.status === 'pending').length,
  );

  const hasPending = computed(() => pendingCount.value > 0);

  function addPending(type: TxType, label: string): string {
    const id = `tx-${nextTxId++}`;
    transactions.value.unshift({
      id,
      type,
      label,
      status: 'pending',
      timestamp: Date.now(),
    });
    return id;
  }

  function markComplete(id: string, txHash?: string) {
    const tx = transactions.value.find((t) => t.id === id);
    if (tx) {
      tx.status = 'complete';
      tx.txHash = txHash;
    }
  }

  function markFailed(id: string, error: unknown) {
    const tx = transactions.value.find((t) => t.id === id);
    if (tx) {
      tx.status = 'failed';
      tx.error = error instanceof Error ? error.message : String(error);
    }
  }

  function clear() {
    transactions.value = transactions.value.filter((tx) => tx.status === 'pending');
  }

  return {
    transactions,
    pendingCount,
    hasPending,
    addPending,
    markComplete,
    markFailed,
    clear,
  };
});
