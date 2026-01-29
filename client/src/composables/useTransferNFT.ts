import { ref } from 'vue';
import { useSdkStore } from '@/stores/sdk';
import { useTransactionStore } from '@/stores/transactions';
import { useNftStore } from '@/stores/nfts';
import { useToast } from '@/composables/useToast';
import { parseError } from '@/lib/errors';
import type { NftBalance } from '@/stores/nfts';

function buildTokenName(nft: NftBalance): string {
  return `${nft.collection}|${nft.category}|${nft.type}|${nft.additionalKey}`;
}

export function useTransferNFT(nft: NftBalance) {
  const isTransferring = ref(false);

  const sdkStore = useSdkStore();
  const transactions = useTransactionStore();
  const nftStore = useNftStore();
  const toast = useToast();

  const displayName = `${nft.collection} ${nft.type}`;

  async function transfer(recipient: string, instanceId: string) {
    const sdk = sdkStore.requireSdk();
    isTransferring.value = true;

    const txId = transactions.addPending('transfer', `Transfer ${displayName} #${instanceId}`);
    const toastId = toast.pending(`Transferring ${displayName} #${instanceId}...`);

    try {
      const txHash = await sdk.transferToken({
        to: recipient,
        tokenName: buildTokenName(nft),
        amount: '1',
      });

      transactions.markComplete(txId, txHash);
      toast.update(toastId, 'success', `Successfully transferred ${displayName} #${instanceId}.`);

      // Refresh NFT balances after successful transfer
      await nftStore.fetchBalances();
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
