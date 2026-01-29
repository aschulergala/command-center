import { ref } from 'vue';
import { useSdkStore } from '@/stores/sdk';
import { useTransactionStore } from '@/stores/transactions';
import { useCreatorStore } from '@/stores/creators';
import { useToast } from '@/composables/useToast';
import { parseError } from '@/lib/errors';

export function useClaimCollection() {
  const isClaiming = ref(false);
  const isChecking = ref(false);
  const isAvailable = ref<boolean | null>(null);

  const sdkStore = useSdkStore();
  const transactions = useTransactionStore();
  const creatorStore = useCreatorStore();
  const toast = useToast();

  async function checkAvailability(name: string) {
    if (!name || name.length < 3) {
      isAvailable.value = null;
      return;
    }

    const sdk = sdkStore.requireSdk();
    isChecking.value = true;

    try {
      const available = await sdk.isNftCollectionAvailable(name);
      isAvailable.value = available;
    } catch {
      isAvailable.value = null;
    } finally {
      isChecking.value = false;
    }
  }

  async function claim(collectionName: string) {
    const sdk = sdkStore.requireSdk();
    isClaiming.value = true;

    const txId = transactions.addPending('claim', `Claim collection "${collectionName}"`);
    const toastId = toast.pending(`Claiming collection "${collectionName}"...`);

    try {
      const result = await sdk.claimNftCollection({ collectionName });

      transactions.markComplete(txId, result.transactionId);
      toast.update(toastId, 'success', `Successfully claimed collection "${collectionName}".`);

      // Refresh collections after successful claim
      await creatorStore.fetchCollections();
    } catch (err) {
      transactions.markFailed(txId, err);
      toast.update(toastId, 'error', parseError(err));
      throw err;
    } finally {
      isClaiming.value = false;
    }
  }

  function resetAvailability() {
    isAvailable.value = null;
  }

  return {
    isClaiming,
    isChecking,
    isAvailable,
    checkAvailability,
    claim,
    resetAvailability,
  };
}
