import { ref } from 'vue';
import { useSdkStore } from '@/stores/sdk';
import { useTransactionStore } from '@/stores/transactions';
import { useNftStore } from '@/stores/nfts';
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

export interface MintNftResult {
  transactionId: string;
  mintedQuantity: string;
  owner: string;
  tokenInstances: number[];
  tokenClass: { collection: string; type: string; category: string };
}

export interface EstimateMintFeeParams {
  collection: string;
  type: string;
  category: string;
  quantity: string;
  ownerAddress: string;
}

export function useMintNFT() {
  const isMinting = ref(false);
  const mintFee = ref<string>('');

  const sdkStore = useSdkStore();
  const transactions = useTransactionStore();
  const nftStore = useNftStore();
  const toast = useToast();

  async function estimateFee(params: EstimateMintFeeParams) {
    const sdk = sdkStore.requireSdk();

    try {
      const fee = await sdk.estimateNftMintFee(params);
      mintFee.value = fee;
    } catch (err) {
      mintFee.value = '';
      toast.error(parseError(err));
    }
  }

  async function mint(params: MintNftParams): Promise<MintNftResult | undefined> {
    const sdk = sdkStore.requireSdk();
    isMinting.value = true;

    const displayName = `${params.collection} ${params.type}`;
    const txId = transactions.addPending('mint', `Mint ${params.quantity}x ${displayName}`);
    const toastId = toast.pending(`Minting ${params.quantity}x ${displayName}...`);

    try {
      const result = await sdk.mintNft(params);

      transactions.markComplete(txId, result.transactionId);
      toast.update(
        toastId,
        'success',
        `Successfully minted ${result.mintedQuantity}x ${displayName}.`,
      );

      // Refresh NFT balances after successful mint
      await nftStore.fetchBalances();

      return result;
    } catch (err) {
      transactions.markFailed(txId, err);
      toast.update(toastId, 'error', parseError(err));
      throw err;
    } finally {
      isMinting.value = false;
    }
  }

  return {
    mint,
    estimateFee,
    isMinting,
    mintFee,
  };
}
