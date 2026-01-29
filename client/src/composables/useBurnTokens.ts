import { ref } from 'vue';
import { useSdkStore } from '@/stores/sdk';
import { useTransactionStore } from '@/stores/transactions';
import { useTokenStore } from '@/stores/tokens';
import { useToast } from '@/composables/useToast';
import { parseError } from '@/lib/errors';

export function useBurnTokens(tokenId: string, displayName: string) {
  const isBurning = ref(false);

  const sdkStore = useSdkStore();
  const transactions = useTransactionStore();
  const tokenStore = useTokenStore();
  const toast = useToast();

  async function burn(amount: string) {
    if (isBurning.value) return;
    const sdk = sdkStore.requireSdk();
    isBurning.value = true;

    const txId = transactions.addPending('burn', `Burn ${displayName}`);
    const toastId = toast.pending(`Burning ${amount} ${displayName}...`);

    try {
      await sdk.burnTokens({
        tokens: [{ tokenName: tokenId, amount }],
      });

      transactions.markComplete(txId);
      toast.update(toastId, 'success', `Successfully burned ${amount} ${displayName}.`);

      // Refresh balances in background - don't let failure affect the tx status
      tokenStore.fetchBalances().catch(() => {});
    } catch (err) {
      transactions.markFailed(txId, err);
      toast.update(toastId, 'error', parseError(err));
      throw err;
    } finally {
      isBurning.value = false;
    }
  }

  return {
    burn,
    isBurning,
  };
}
