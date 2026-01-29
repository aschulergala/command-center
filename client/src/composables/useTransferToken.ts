import { ref } from 'vue';
import { useSdkStore } from '@/stores/sdk';
import { useTransactionStore } from '@/stores/transactions';
import { useTokenStore } from '@/stores/tokens';
import { useToast } from '@/composables/useToast';
import { parseError } from '@/lib/errors';
import { GALA_TOKEN_ID } from '@/lib/constants';

export function useTransferToken(tokenId: string, displayName: string) {
  const isTransferring = ref(false);

  const sdkStore = useSdkStore();
  const transactions = useTransactionStore();
  const tokenStore = useTokenStore();
  const toast = useToast();

  async function transfer(recipient: string, amount: string) {
    if (isTransferring.value) return;
    const sdk = sdkStore.requireSdk();
    isTransferring.value = true;

    const txId = transactions.addPending('transfer', `Transfer ${displayName}`);
    const toastId = toast.pending(`Transferring ${amount} ${displayName}...`);

    try {
      let txHash: string;

      if (tokenId === GALA_TOKEN_ID) {
        txHash = await sdk.transferGala({
          recipientAddress: recipient,
          amount,
        });
      } else {
        txHash = await sdk.transferToken({
          to: recipient,
          tokenName: tokenId,
          amount,
        });
      }

      transactions.markComplete(txId, txHash);
      toast.update(toastId, 'success', `Successfully transferred ${amount} ${displayName}.`);

      // Refresh balances in background - don't let failure affect the tx status
      tokenStore.fetchBalances().catch(() => {});
    } catch (err) {
      transactions.markFailed(txId, err);
      toast.update(toastId, 'error', parseError(err));
      throw err;
    } finally {
      isTransferring.value = false;
    }
  }

  return {
    transfer,
    isTransferring,
  };
}
