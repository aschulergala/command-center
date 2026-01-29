import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useCreateTokenClass } from '@/composables/useCreateTokenClass';
import type { CreateTokenClassParams } from '@/composables/useCreateTokenClass';
import { useSdkStore } from '@/stores/sdk';
import { useTransactionStore } from '@/stores/transactions';
import { useToastStore } from '@/stores/toasts';
import { useCreatorStore } from '@/stores/creators';

function getMockSdk() {
  const sdkStore = useSdkStore();
  return sdkStore.sdk!;
}

const mockParams: CreateTokenClassParams = {
  collection: 'TestCollection',
  type: 'Sword',
  category: 'Weapon',
  name: 'Epic Sword',
  description: 'A mighty blade',
  maxSupply: '100',
};

describe('useCreateTokenClass', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    const sdkStore = useSdkStore();
    sdkStore.initialize();
  });

  it('returns create function and isCreating ref', () => {
    const { create, isCreating } = useCreateTokenClass();
    expect(typeof create).toBe('function');
    expect(isCreating.value).toBe(false);
  });

  describe('create', () => {
    it('calls sdk.createNftTokenClass with params', async () => {
      const sdk = getMockSdk();
      (sdk.createNftTokenClass as ReturnType<typeof vi.fn>).mockResolvedValue({
        transactionId: 'tx-class-1',
      });

      const { create } = useCreateTokenClass();
      await create(mockParams);

      expect(sdk.createNftTokenClass).toHaveBeenCalledWith(mockParams);
    });

    it('creates pending transaction and toast with name label', async () => {
      const sdk = getMockSdk();
      (sdk.createNftTokenClass as ReturnType<typeof vi.fn>).mockResolvedValue({
        transactionId: 'tx-class-1',
      });

      const transactions = useTransactionStore();
      const toastStore = useToastStore();

      const addPendingSpy = vi.spyOn(transactions, 'addPending');
      const pendingSpy = vi.spyOn(toastStore, 'pending');

      const { create } = useCreateTokenClass();
      await create(mockParams);

      expect(addPendingSpy).toHaveBeenCalledWith('create', 'Create token class "Epic Sword"');
      expect(pendingSpy).toHaveBeenCalledWith('Creating token class "Epic Sword"...');
    });

    it('uses type/category as label when name is not provided', async () => {
      const sdk = getMockSdk();
      (sdk.createNftTokenClass as ReturnType<typeof vi.fn>).mockResolvedValue({
        transactionId: 'tx-class-1',
      });

      const transactions = useTransactionStore();
      const toastStore = useToastStore();

      const addPendingSpy = vi.spyOn(transactions, 'addPending');
      const pendingSpy = vi.spyOn(toastStore, 'pending');

      const paramsNoName: CreateTokenClassParams = {
        collection: 'TestCollection',
        type: 'Sword',
        category: 'Weapon',
      };

      const { create } = useCreateTokenClass();
      await create(paramsNoName);

      expect(addPendingSpy).toHaveBeenCalledWith('create', 'Create token class "Sword/Weapon"');
      expect(pendingSpy).toHaveBeenCalledWith('Creating token class "Sword/Weapon"...');
    });

    it('marks tx complete and updates toast on success', async () => {
      const sdk = getMockSdk();
      (sdk.createNftTokenClass as ReturnType<typeof vi.fn>).mockResolvedValue({
        transactionId: 'tx-class-1',
      });

      const transactions = useTransactionStore();
      const toastStore = useToastStore();

      const markCompleteSpy = vi.spyOn(transactions, 'markComplete');
      const updateSpy = vi.spyOn(toastStore, 'update');

      const { create } = useCreateTokenClass();
      await create(mockParams);

      expect(markCompleteSpy).toHaveBeenCalledWith(expect.any(String), 'tx-class-1');
      expect(updateSpy).toHaveBeenCalledWith(
        expect.any(Number),
        'success',
        'Successfully created token class "Epic Sword".',
      );
    });

    it('refreshes token classes when selectedCollection is set', async () => {
      const sdk = getMockSdk();
      (sdk.createNftTokenClass as ReturnType<typeof vi.fn>).mockResolvedValue({
        transactionId: 'tx-class-1',
      });

      const creatorStore = useCreatorStore();
      creatorStore.selectedCollection = {
        authorizedUser: '0xABC',
        collection: 'TestCollection',
      };
      creatorStore.fetchTokenClasses = vi.fn().mockResolvedValue(undefined);

      const { create } = useCreateTokenClass();
      await create(mockParams);

      expect(creatorStore.fetchTokenClasses).toHaveBeenCalledWith('TestCollection');
    });

    it('does not refresh token classes when selectedCollection is not set', async () => {
      const sdk = getMockSdk();
      (sdk.createNftTokenClass as ReturnType<typeof vi.fn>).mockResolvedValue({
        transactionId: 'tx-class-1',
      });

      const creatorStore = useCreatorStore();
      creatorStore.selectedCollection = null;
      creatorStore.fetchTokenClasses = vi.fn().mockResolvedValue(undefined);

      const { create } = useCreateTokenClass();
      await create(mockParams);

      expect(creatorStore.fetchTokenClasses).not.toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('marks tx failed and throws on error', async () => {
      const sdk = getMockSdk();
      const error = new Error('Create failed');
      (sdk.createNftTokenClass as ReturnType<typeof vi.fn>).mockRejectedValue(error);

      const transactions = useTransactionStore();
      const toastStore = useToastStore();

      const markFailedSpy = vi.spyOn(transactions, 'markFailed');
      const updateSpy = vi.spyOn(toastStore, 'update');

      const { create } = useCreateTokenClass();

      await expect(create(mockParams)).rejects.toThrow('Create failed');

      expect(markFailedSpy).toHaveBeenCalledWith(expect.any(String), error);
      expect(updateSpy).toHaveBeenCalledWith(
        expect.any(Number),
        'error',
        'Create failed',
      );
    });

    it('throws the error after handling', async () => {
      const sdk = getMockSdk();
      (sdk.createNftTokenClass as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Boom'));

      const { create } = useCreateTokenClass();

      await expect(create(mockParams)).rejects.toThrow('Boom');
    });
  });

  describe('isCreating loading state', () => {
    it('is true during create and false after success', async () => {
      const sdk = getMockSdk();
      let resolveCreate: (value: { transactionId: string }) => void;
      (sdk.createNftTokenClass as ReturnType<typeof vi.fn>).mockImplementation(
        () => new Promise((resolve) => { resolveCreate = resolve; }),
      );

      const { create, isCreating } = useCreateTokenClass();

      expect(isCreating.value).toBe(false);

      const promise = create(mockParams);
      await vi.waitFor(() => {
        expect(isCreating.value).toBe(true);
      });

      resolveCreate!({ transactionId: 'tx-1' });
      await promise;

      expect(isCreating.value).toBe(false);
    });

    it('is false after error', async () => {
      const sdk = getMockSdk();
      (sdk.createNftTokenClass as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('fail'));

      const { create, isCreating } = useCreateTokenClass();

      await expect(create(mockParams)).rejects.toThrow();

      expect(isCreating.value).toBe(false);
    });
  });
});
