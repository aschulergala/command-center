import { ref } from 'vue';
import { useSdkStore } from '@/stores/sdk';
import { useTransactionStore } from '@/stores/transactions';
import { useNftStore } from '@/stores/nfts';
import { useToast } from '@/composables/useToast';
import { parseError } from '@/lib/errors';
import { buildTokenName } from '@/lib/nft-utils';
import type { NftBalance } from '@/stores/nfts';

export function useBurnNFT(nft: NftBalance) {
  const isBurning = ref(false);

  const sdkStore = useSdkStore();
  const transactions = useTransactionStore();
  const nftStore = useNftStore();
  const toast = useToast();

  const displayName = `${nft.collection} ${nft.type}`;

  async function burn(instanceId: string) {
    if (isBurning.value) return;
    const sdk = sdkStore.requireSdk();
    isBurning.value = true;

    const txId = transactions.addPending('burn', `Burn ${displayName} #${instanceId}`);
    const toastId = toast.pending(`Burning ${displayName} #${instanceId}...`);

    try {
      await sdk.burnTokens({
        tokens: [{ tokenName: buildTokenName(nft), amount: '1' }],
      });

      transactions.markComplete(txId);
      toast.update(toastId, 'success', `Successfully burned ${displayName} #${instanceId}.`);

      // Refresh NFT balances in background - don't let failure affect the tx status
      nftStore.fetchBalances().catch(() => {});
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
