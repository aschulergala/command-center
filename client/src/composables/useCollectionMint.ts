import { ref } from 'vue';
import { useSdkStore } from '@/stores/sdk';
import { useTransactionStore } from '@/stores/transactions';
import { useCreatorStore } from '@/stores/creators';
import { useToast } from '@/composables/useToast';
import { parseError } from '@/lib/errors';

export interface MintNftParams {
  collection: string;
  type: string;
  category: string;
  quantity: string;
  ownerAddress: string;
  additionalKey?: string;
}

export interface EstimateMintFeeParams {
  collection: string;
  type: string;
  category: string;
  quantity: string;
  ownerAddress: string;
}

export function useCollectionMint() {
  const isMinting = ref(false);
  const mintFee = ref<string>('');
  const isEstimating = ref(false);

  const sdkStore = useSdkStore();
  const transactions = useTransactionStore();
  const creatorStore = useCreatorStore();
  const toast = useToast();

  async function estimateFee(params: EstimateMintFeeParams) {
    const sdk = sdkStore.requireSdk();
    isEstimating.value = true;

    try {
      const fee = await sdk.estimateNftMintFee(params);
      mintFee.value = fee;
    } catch {
      mintFee.value = '';
    } finally {
      isEstimating.value = false;
    }
  }

  async function mint(params: MintNftParams) {
    const sdk = sdkStore.requireSdk();
    isMinting.value = true;

    const txId = transactions.addPending('mint', `Mint ${params.quantity} NFTs`);
    const toastId = toast.pending(`Minting ${params.quantity} NFTs...`);

    try {
      const result = await sdk.mintNft(params);

      transactions.markComplete(txId, result.transactionId);
      toast.update(
        toastId,
        'success',
        `Successfully minted ${result.mintedQuantity} NFTs.`,
      );

      // Refresh token classes to update supply counts
      if (creatorStore.selectedCollection) {
        await creatorStore.fetchTokenClasses(creatorStore.selectedCollection.collection);
      }
    } catch (err) {
      transactions.markFailed(txId, err);
      toast.update(toastId, 'error', parseError(err));
      throw err;
    } finally {
      isMinting.value = false;
    }
  }

  function resetFee() {
    mintFee.value = '';
  }

  return {
    isMinting,
    mintFee,
    isEstimating,
    estimateFee,
    mint,
    resetFee,
  };
}
