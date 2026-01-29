import { ref } from 'vue';
import { useSdkStore } from '@/stores/sdk';
import { useTransactionStore } from '@/stores/transactions';
import { useCreatorStore } from '@/stores/creators';
import { useToast } from '@/composables/useToast';
import { parseError } from '@/lib/errors';

export interface CreateTokenClassParams {
  collection: string;
  type: string;
  category: string;
  name?: string;
  description?: string;
  image?: string;
  symbol?: string;
  rarity?: string;
  maxSupply?: string;
  maxCapacity?: string;
  additionalKey?: string;
  metadataAddress?: string;
}

export function useCreateTokenClass() {
  const isCreating = ref(false);

  const sdkStore = useSdkStore();
  const transactions = useTransactionStore();
  const creatorStore = useCreatorStore();
  const toast = useToast();

  async function create(params: CreateTokenClassParams) {
    if (isCreating.value) return;
    const sdk = sdkStore.requireSdk();
    isCreating.value = true;

    const label = params.name || `${params.type}/${params.category}`;
    const txId = transactions.addPending('create', `Create token class "${label}"`);
    const toastId = toast.pending(`Creating token class "${label}"...`);

    try {
      const result = await sdk.createNftTokenClass(params);

      transactions.markComplete(txId, result.transactionId);
      toast.update(toastId, 'success', `Successfully created token class "${label}".`);

      // Refresh token classes in background - don't let failure affect the tx status
      if (creatorStore.selectedCollection) {
        creatorStore.fetchTokenClasses(creatorStore.selectedCollection.collection).catch(() => {});
      }
    } catch (err) {
      transactions.markFailed(txId, err);
      toast.update(toastId, 'error', parseError(err));
      throw err;
    } finally {
      isCreating.value = false;
    }
  }

  return {
    create,
    isCreating,
  };
}
