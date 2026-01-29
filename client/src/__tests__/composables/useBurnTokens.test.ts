import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useBurnTokens } from '@/composables/useBurnTokens';
import { useSdkStore } from '@/stores/sdk';
import { useTransactionStore } from '@/stores/transactions';
import { useToastStore } from '@/stores/toasts';
import { useTokenStore } from '@/stores/tokens';

function getMockSdk() {
  const sdkStore = useSdkStore();
  return sdkStore.sdk!;
}

describe('useBurnTokens', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    const sdkStore = useSdkStore();
    sdkStore.initialize();
  });

  it('returns burn function and isBurning ref', () => {
    const { burn, isBurning } = useBurnTokens('TOKEN|Unit|none|none', 'TOKEN');
    expect(typeof burn).toBe('function');
    expect(isBurning.value).toBe(false);
  });

  describe('burn', () => {
    it('calls sdk.burnTokens with correct arguments', async () => {
      const sdk = getMockSdk();
      (sdk.burnTokens as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

      const tokenStore = useTokenStore();
      tokenStore.fetchBalances = vi.fn().mockResolvedValue(undefined);

      const { burn } = useBurnTokens('GYRI|Unit|none|none', 'GYRI');
      await burn('500');

      expect(sdk.burnTokens).toHaveBeenCalledWith({
        tokens: [{ tokenName: 'GYRI|Unit|none|none', amount: '500' }],
      });
    });

    it('creates pending transaction and toast before the call', async () => {
      const sdk = getMockSdk();
      (sdk.burnTokens as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

      const transactions = useTransactionStore();
      const toastStore = useToastStore();
      const tokenStore = useTokenStore();
      tokenStore.fetchBalances = vi.fn().mockResolvedValue(undefined);

      const addPendingSpy = vi.spyOn(transactions, 'addPending');
      const pendingSpy = vi.spyOn(toastStore, 'pending');

      const { burn } = useBurnTokens('GYRI|Unit|none|none', 'GYRI');
      await burn('100');

      expect(addPendingSpy).toHaveBeenCalledWith('burn', 'Burn GYRI');
      expect(pendingSpy).toHaveBeenCalledWith('Burning 100 GYRI...');
    });

    it('marks tx complete and updates toast on success', async () => {
      const sdk = getMockSdk();
      (sdk.burnTokens as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

      const transactions = useTransactionStore();
      const toastStore = useToastStore();
      const tokenStore = useTokenStore();
      tokenStore.fetchBalances = vi.fn().mockResolvedValue(undefined);

      const markCompleteSpy = vi.spyOn(transactions, 'markComplete');
      const updateSpy = vi.spyOn(toastStore, 'update');

      const { burn } = useBurnTokens('GYRI|Unit|none|none', 'GYRI');
      await burn('100');

      expect(markCompleteSpy).toHaveBeenCalledWith(expect.any(String));
      expect(updateSpy).toHaveBeenCalledWith(
        expect.any(Number),
        'success',
        'Successfully burned 100 GYRI.',
      );
    });

    it('refreshes token balances on success', async () => {
      const sdk = getMockSdk();
      (sdk.burnTokens as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

      const tokenStore = useTokenStore();
      tokenStore.fetchBalances = vi.fn().mockResolvedValue(undefined);

      const { burn } = useBurnTokens('GYRI|Unit|none|none', 'GYRI');
      await burn('100');

      expect(tokenStore.fetchBalances).toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('marks tx failed and updates toast to error on failure', async () => {
      const sdk = getMockSdk();
      const error = new Error('Burn failed');
      (sdk.burnTokens as ReturnType<typeof vi.fn>).mockRejectedValue(error);

      const transactions = useTransactionStore();
      const toastStore = useToastStore();

      const markFailedSpy = vi.spyOn(transactions, 'markFailed');
      const updateSpy = vi.spyOn(toastStore, 'update');

      const { burn } = useBurnTokens('GYRI|Unit|none|none', 'GYRI');

      await expect(burn('100')).rejects.toThrow('Burn failed');

      expect(markFailedSpy).toHaveBeenCalledWith(expect.any(String), error);
      expect(updateSpy).toHaveBeenCalledWith(
        expect.any(Number),
        'error',
        'Burn failed',
      );
    });

    it('throws the error after handling', async () => {
      const sdk = getMockSdk();
      (sdk.burnTokens as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Boom'));

      const { burn } = useBurnTokens('GYRI|Unit|none|none', 'GYRI');

      await expect(burn('10')).rejects.toThrow('Boom');
    });
  });

  describe('isBurning loading state', () => {
    it('is true during burn and false after success', async () => {
      const sdk = getMockSdk();
      let resolveBurn: () => void;
      (sdk.burnTokens as ReturnType<typeof vi.fn>).mockImplementation(
        () => new Promise<void>((resolve) => { resolveBurn = resolve; }),
      );

      const tokenStore = useTokenStore();
      tokenStore.fetchBalances = vi.fn().mockResolvedValue(undefined);

      const { burn, isBurning } = useBurnTokens('GYRI|Unit|none|none', 'GYRI');

      expect(isBurning.value).toBe(false);

      const promise = burn('50');
      await vi.waitFor(() => {
        expect(isBurning.value).toBe(true);
      });

      resolveBurn!();
      await promise;

      expect(isBurning.value).toBe(false);
    });

    it('is false after error', async () => {
      const sdk = getMockSdk();
      (sdk.burnTokens as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('fail'));

      const { burn, isBurning } = useBurnTokens('GYRI|Unit|none|none', 'GYRI');

      await expect(burn('50')).rejects.toThrow();

      expect(isBurning.value).toBe(false);
    });
  });
});
