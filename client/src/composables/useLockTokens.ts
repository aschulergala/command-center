import { ref } from 'vue';
import { useSdkStore } from '@/stores/sdk';
import { useTransactionStore } from '@/stores/transactions';
import { useTokenStore } from '@/stores/tokens';
import { useToast } from '@/composables/useToast';
import { parseError } from '@/lib/errors';

export function useLockTokens(tokenId: string, displayName: string) {
  const isLocking = ref(false);
  const isUnlocking = ref(false);

  const sdkStore = useSdkStore();
  const transactions = useTransactionStore();
  const tokenStore = useTokenStore();
  const toast = useToast();

  async function lock(amount: string) {
    const sdk = sdkStore.requireSdk();
    isLocking.value = true;

    const txId = transactions.addPending('lock', `Lock ${displayName}`);
    const toastId = toast.pending(`Locking ${amount} ${displayName}...`);

    try {
      await sdk.lockTokens({
        tokens: [{ tokenName: tokenId, amount }],
      });

      transactions.markComplete(txId);
      toast.update(toastId, 'success', `Successfully locked ${amount} ${displayName}.`);

      await tokenStore.fetchBalances();
    } catch (err) {
      transactions.markFailed(txId, err);
      toast.update(toastId, 'error', parseError(err));
      throw err;
    } finally {
      isLocking.value = false;
    }
  }

  async function unlock(amount: string) {
    const sdk = sdkStore.requireSdk();
    isUnlocking.value = true;

    const txId = transactions.addPending('unlock', `Unlock ${displayName}`);
    const toastId = toast.pending(`Unlocking ${amount} ${displayName}...`);

    try {
      await sdk.unlockTokens({
        tokens: [{ tokenName: tokenId, amount }],
      });

      transactions.markComplete(txId);
      toast.update(toastId, 'success', `Successfully unlocked ${amount} ${displayName}.`);

      await tokenStore.fetchBalances();
    } catch (err) {
      transactions.markFailed(txId, err);
      toast.update(toastId, 'error', parseError(err));
      throw err;
    } finally {
      isUnlocking.value = false;
    }
  }

  return {
    lock,
    unlock,
    isLocking,
    isUnlocking,
  };
}
