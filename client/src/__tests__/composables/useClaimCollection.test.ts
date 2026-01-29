import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useClaimCollection } from '@/composables/useClaimCollection';
import { useSdkStore } from '@/stores/sdk';
import { useTransactionStore } from '@/stores/transactions';
import { useToastStore } from '@/stores/toasts';
import { useCreatorStore } from '@/stores/creators';

function getMockSdk() {
  const sdkStore = useSdkStore();
  return sdkStore.sdk!;
}

describe('useClaimCollection', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    const sdkStore = useSdkStore();
    sdkStore.initialize();
  });

  it('returns all expected properties', () => {
    const { isClaiming, isChecking, isAvailable, checkAvailability, claim, resetAvailability } =
      useClaimCollection();
    expect(typeof checkAvailability).toBe('function');
    expect(typeof claim).toBe('function');
    expect(typeof resetAvailability).toBe('function');
    expect(isClaiming.value).toBe(false);
    expect(isChecking.value).toBe(false);
    expect(isAvailable.value).toBeNull();
  });

  describe('checkAvailability', () => {
    it('calls sdk.isNftCollectionAvailable and sets isAvailable to true', async () => {
      const sdk = getMockSdk();
      (sdk.isNftCollectionAvailable as ReturnType<typeof vi.fn>).mockResolvedValue(true);

      const { checkAvailability, isAvailable } = useClaimCollection();
      await checkAvailability('MyCollection');

      expect(sdk.isNftCollectionAvailable).toHaveBeenCalledWith('MyCollection');
      expect(isAvailable.value).toBe(true);
    });

    it('calls sdk.isNftCollectionAvailable and sets isAvailable to false', async () => {
      const sdk = getMockSdk();
      (sdk.isNftCollectionAvailable as ReturnType<typeof vi.fn>).mockResolvedValue(false);

      const { checkAvailability, isAvailable } = useClaimCollection();
      await checkAvailability('TakenName');

      expect(sdk.isNftCollectionAvailable).toHaveBeenCalledWith('TakenName');
      expect(isAvailable.value).toBe(false);
    });

    it('sets isAvailable to null for empty name without calling SDK', async () => {
      const sdk = getMockSdk();

      const { checkAvailability, isAvailable } = useClaimCollection();
      await checkAvailability('');

      expect(sdk.isNftCollectionAvailable).not.toHaveBeenCalled();
      expect(isAvailable.value).toBeNull();
    });

    it('sets isAvailable to null for name shorter than 3 characters without calling SDK', async () => {
      const sdk = getMockSdk();

      const { checkAvailability, isAvailable } = useClaimCollection();
      await checkAvailability('AB');

      expect(sdk.isNftCollectionAvailable).not.toHaveBeenCalled();
      expect(isAvailable.value).toBeNull();
    });

    it('sets isAvailable to null on SDK error', async () => {
      const sdk = getMockSdk();
      (sdk.isNftCollectionAvailable as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Network error'),
      );

      const { checkAvailability, isAvailable } = useClaimCollection();

      // Set to a truthy value first to make sure it resets
      isAvailable.value = true;

      await checkAvailability('FailCollection');

      expect(isAvailable.value).toBeNull();
    });

    it('manages isChecking loading state', async () => {
      const sdk = getMockSdk();
      let resolveCheck: (value: boolean) => void;
      (sdk.isNftCollectionAvailable as ReturnType<typeof vi.fn>).mockImplementation(
        () => new Promise<boolean>((resolve) => { resolveCheck = resolve; }),
      );

      const { checkAvailability, isChecking } = useClaimCollection();

      expect(isChecking.value).toBe(false);

      const promise = checkAvailability('TestName');
      await vi.waitFor(() => {
        expect(isChecking.value).toBe(true);
      });

      resolveCheck!(true);
      await promise;

      expect(isChecking.value).toBe(false);
    });
  });

  describe('claim', () => {
    it('calls sdk.claimNftCollection with collectionName', async () => {
      const sdk = getMockSdk();
      (sdk.claimNftCollection as ReturnType<typeof vi.fn>).mockResolvedValue({
        transactionId: 'tx-claim-1',
      });

      const creatorStore = useCreatorStore();
      creatorStore.fetchCollections = vi.fn().mockResolvedValue(undefined);

      const { claim } = useClaimCollection();
      await claim('NewCollection');

      expect(sdk.claimNftCollection).toHaveBeenCalledWith({ collectionName: 'NewCollection' });
    });

    it('creates pending transaction and toast', async () => {
      const sdk = getMockSdk();
      (sdk.claimNftCollection as ReturnType<typeof vi.fn>).mockResolvedValue({
        transactionId: 'tx-claim-1',
      });

      const transactions = useTransactionStore();
      const toastStore = useToastStore();
      const creatorStore = useCreatorStore();
      creatorStore.fetchCollections = vi.fn().mockResolvedValue(undefined);

      const addPendingSpy = vi.spyOn(transactions, 'addPending');
      const pendingSpy = vi.spyOn(toastStore, 'pending');

      const { claim } = useClaimCollection();
      await claim('NewCollection');

      expect(addPendingSpy).toHaveBeenCalledWith('claim', 'Claim collection "NewCollection"');
      expect(pendingSpy).toHaveBeenCalledWith('Claiming collection "NewCollection"...');
    });

    it('marks tx complete and updates toast on success', async () => {
      const sdk = getMockSdk();
      (sdk.claimNftCollection as ReturnType<typeof vi.fn>).mockResolvedValue({
        transactionId: 'tx-claim-1',
      });

      const transactions = useTransactionStore();
      const toastStore = useToastStore();
      const creatorStore = useCreatorStore();
      creatorStore.fetchCollections = vi.fn().mockResolvedValue(undefined);

      const markCompleteSpy = vi.spyOn(transactions, 'markComplete');
      const updateSpy = vi.spyOn(toastStore, 'update');

      const { claim } = useClaimCollection();
      await claim('NewCollection');

      expect(markCompleteSpy).toHaveBeenCalledWith(expect.any(String), 'tx-claim-1');
      expect(updateSpy).toHaveBeenCalledWith(
        expect.any(Number),
        'success',
        'Successfully claimed collection "NewCollection".',
      );
    });

    it('refreshes creator collections on success', async () => {
      const sdk = getMockSdk();
      (sdk.claimNftCollection as ReturnType<typeof vi.fn>).mockResolvedValue({
        transactionId: 'tx-claim-1',
      });

      const creatorStore = useCreatorStore();
      creatorStore.fetchCollections = vi.fn().mockResolvedValue(undefined);

      const { claim } = useClaimCollection();
      await claim('NewCollection');

      expect(creatorStore.fetchCollections).toHaveBeenCalled();
    });

    it('marks tx failed and updates toast on error', async () => {
      const sdk = getMockSdk();
      const error = new Error('Claim failed');
      (sdk.claimNftCollection as ReturnType<typeof vi.fn>).mockRejectedValue(error);

      const transactions = useTransactionStore();
      const toastStore = useToastStore();

      const markFailedSpy = vi.spyOn(transactions, 'markFailed');
      const updateSpy = vi.spyOn(toastStore, 'update');

      const { claim } = useClaimCollection();

      await expect(claim('FailCollection')).rejects.toThrow('Claim failed');

      expect(markFailedSpy).toHaveBeenCalledWith(expect.any(String), error);
      expect(updateSpy).toHaveBeenCalledWith(
        expect.any(Number),
        'error',
        'Claim failed',
      );
    });

    it('throws the error after handling', async () => {
      const sdk = getMockSdk();
      (sdk.claimNftCollection as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Boom'));

      const { claim } = useClaimCollection();

      await expect(claim('FailCollection')).rejects.toThrow('Boom');
    });

    it('manages isClaiming loading state', async () => {
      const sdk = getMockSdk();
      let resolveClaim: (value: { transactionId: string }) => void;
      (sdk.claimNftCollection as ReturnType<typeof vi.fn>).mockImplementation(
        () => new Promise((resolve) => { resolveClaim = resolve; }),
      );

      const creatorStore = useCreatorStore();
      creatorStore.fetchCollections = vi.fn().mockResolvedValue(undefined);

      const { claim, isClaiming } = useClaimCollection();

      expect(isClaiming.value).toBe(false);

      const promise = claim('TestCollection');
      await vi.waitFor(() => {
        expect(isClaiming.value).toBe(true);
      });

      resolveClaim!({ transactionId: 'tx-1' });
      await promise;

      expect(isClaiming.value).toBe(false);
    });

    it('isClaiming is false after error', async () => {
      const sdk = getMockSdk();
      (sdk.claimNftCollection as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('fail'));

      const { claim, isClaiming } = useClaimCollection();

      await expect(claim('FailCollection')).rejects.toThrow();

      expect(isClaiming.value).toBe(false);
    });
  });

  describe('resetAvailability', () => {
    it('sets isAvailable to null', async () => {
      const sdk = getMockSdk();
      (sdk.isNftCollectionAvailable as ReturnType<typeof vi.fn>).mockResolvedValue(true);

      const { checkAvailability, isAvailable, resetAvailability } = useClaimCollection();

      await checkAvailability('AvailableName');
      expect(isAvailable.value).toBe(true);

      resetAvailability();
      expect(isAvailable.value).toBeNull();
    });
  });
});
