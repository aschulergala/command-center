import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useLockTokens } from '@/composables/useLockTokens';
import { useSdkStore } from '@/stores/sdk';
import { useTransactionStore } from '@/stores/transactions';
import { useToastStore } from '@/stores/toasts';
import { useTokenStore } from '@/stores/tokens';

function getMockSdk() {
  const sdkStore = useSdkStore();
  return sdkStore.sdk!;
}

describe('useLockTokens', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    const sdkStore = useSdkStore();
    sdkStore.initialize();
  });

  it('returns lock, unlock, isLocking, and isUnlocking', () => {
    const { lock, unlock, isLocking, isUnlocking } = useLockTokens('TOKEN|Unit|none|none', 'TOKEN');
    expect(typeof lock).toBe('function');
    expect(typeof unlock).toBe('function');
    expect(isLocking.value).toBe(false);
    expect(isUnlocking.value).toBe(false);
  });

  describe('lock', () => {
    it('calls sdk.lockTokens with correct arguments', async () => {
      const sdk = getMockSdk();
      (sdk.lockTokens as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

      const tokenStore = useTokenStore();
      tokenStore.fetchBalances = vi.fn().mockResolvedValue(undefined);

      const { lock } = useLockTokens('GYRI|Unit|none|none', 'GYRI');
      await lock('250');

      expect(sdk.lockTokens).toHaveBeenCalledWith({
        tokens: [{ tokenName: 'GYRI|Unit|none|none', amount: '250' }],
      });
    });

    it('creates pending transaction and toast', async () => {
      const sdk = getMockSdk();
      (sdk.lockTokens as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

      const transactions = useTransactionStore();
      const toastStore = useToastStore();
      const tokenStore = useTokenStore();
      tokenStore.fetchBalances = vi.fn().mockResolvedValue(undefined);

      const addPendingSpy = vi.spyOn(transactions, 'addPending');
      const pendingSpy = vi.spyOn(toastStore, 'pending');

      const { lock } = useLockTokens('GYRI|Unit|none|none', 'GYRI');
      await lock('250');

      expect(addPendingSpy).toHaveBeenCalledWith('lock', 'Lock GYRI');
      expect(pendingSpy).toHaveBeenCalledWith('Locking 250 GYRI...');
    });

    it('marks tx complete and updates toast on success', async () => {
      const sdk = getMockSdk();
      (sdk.lockTokens as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

      const transactions = useTransactionStore();
      const toastStore = useToastStore();
      const tokenStore = useTokenStore();
      tokenStore.fetchBalances = vi.fn().mockResolvedValue(undefined);

      const markCompleteSpy = vi.spyOn(transactions, 'markComplete');
      const updateSpy = vi.spyOn(toastStore, 'update');

      const { lock } = useLockTokens('GYRI|Unit|none|none', 'GYRI');
      await lock('250');

      expect(markCompleteSpy).toHaveBeenCalledWith(expect.any(String));
      expect(updateSpy).toHaveBeenCalledWith(
        expect.any(Number),
        'success',
        'Successfully locked 250 GYRI.',
      );
    });

    it('refreshes token balances on success', async () => {
      const sdk = getMockSdk();
      (sdk.lockTokens as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

      const tokenStore = useTokenStore();
      tokenStore.fetchBalances = vi.fn().mockResolvedValue(undefined);

      const { lock } = useLockTokens('GYRI|Unit|none|none', 'GYRI');
      await lock('250');

      expect(tokenStore.fetchBalances).toHaveBeenCalled();
    });

    it('marks tx failed and updates toast on error', async () => {
      const sdk = getMockSdk();
      const error = new Error('Lock failed');
      (sdk.lockTokens as ReturnType<typeof vi.fn>).mockRejectedValue(error);

      const transactions = useTransactionStore();
      const toastStore = useToastStore();

      const markFailedSpy = vi.spyOn(transactions, 'markFailed');
      const updateSpy = vi.spyOn(toastStore, 'update');

      const { lock } = useLockTokens('GYRI|Unit|none|none', 'GYRI');
      await expect(lock('250')).rejects.toThrow('Lock failed');

      expect(markFailedSpy).toHaveBeenCalledWith(expect.any(String), error);
      expect(updateSpy).toHaveBeenCalledWith(
        expect.any(Number),
        'error',
        'Lock failed',
      );
    });

    it('throws the error after handling', async () => {
      const sdk = getMockSdk();
      (sdk.lockTokens as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Boom'));

      const { lock } = useLockTokens('GYRI|Unit|none|none', 'GYRI');
      await expect(lock('100')).rejects.toThrow('Boom');
    });
  });

  describe('unlock', () => {
    it('calls sdk.unlockTokens with correct arguments', async () => {
      const sdk = getMockSdk();
      (sdk.unlockTokens as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

      const tokenStore = useTokenStore();
      tokenStore.fetchBalances = vi.fn().mockResolvedValue(undefined);

      const { unlock } = useLockTokens('GYRI|Unit|none|none', 'GYRI');
      await unlock('100');

      expect(sdk.unlockTokens).toHaveBeenCalledWith({
        tokens: [{ tokenName: 'GYRI|Unit|none|none', amount: '100' }],
      });
    });

    it('creates pending transaction and toast', async () => {
      const sdk = getMockSdk();
      (sdk.unlockTokens as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

      const transactions = useTransactionStore();
      const toastStore = useToastStore();
      const tokenStore = useTokenStore();
      tokenStore.fetchBalances = vi.fn().mockResolvedValue(undefined);

      const addPendingSpy = vi.spyOn(transactions, 'addPending');
      const pendingSpy = vi.spyOn(toastStore, 'pending');

      const { unlock } = useLockTokens('GYRI|Unit|none|none', 'GYRI');
      await unlock('100');

      expect(addPendingSpy).toHaveBeenCalledWith('unlock', 'Unlock GYRI');
      expect(pendingSpy).toHaveBeenCalledWith('Unlocking 100 GYRI...');
    });

    it('marks tx complete and updates toast on success', async () => {
      const sdk = getMockSdk();
      (sdk.unlockTokens as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

      const transactions = useTransactionStore();
      const toastStore = useToastStore();
      const tokenStore = useTokenStore();
      tokenStore.fetchBalances = vi.fn().mockResolvedValue(undefined);

      const markCompleteSpy = vi.spyOn(transactions, 'markComplete');
      const updateSpy = vi.spyOn(toastStore, 'update');

      const { unlock } = useLockTokens('GYRI|Unit|none|none', 'GYRI');
      await unlock('100');

      expect(markCompleteSpy).toHaveBeenCalledWith(expect.any(String));
      expect(updateSpy).toHaveBeenCalledWith(
        expect.any(Number),
        'success',
        'Successfully unlocked 100 GYRI.',
      );
    });

    it('refreshes token balances on success', async () => {
      const sdk = getMockSdk();
      (sdk.unlockTokens as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

      const tokenStore = useTokenStore();
      tokenStore.fetchBalances = vi.fn().mockResolvedValue(undefined);

      const { unlock } = useLockTokens('GYRI|Unit|none|none', 'GYRI');
      await unlock('100');

      expect(tokenStore.fetchBalances).toHaveBeenCalled();
    });

    it('marks tx failed and updates toast on error', async () => {
      const sdk = getMockSdk();
      const error = new Error('Unlock failed');
      (sdk.unlockTokens as ReturnType<typeof vi.fn>).mockRejectedValue(error);

      const transactions = useTransactionStore();
      const toastStore = useToastStore();

      const markFailedSpy = vi.spyOn(transactions, 'markFailed');
      const updateSpy = vi.spyOn(toastStore, 'update');

      const { unlock } = useLockTokens('GYRI|Unit|none|none', 'GYRI');
      await expect(unlock('100')).rejects.toThrow('Unlock failed');

      expect(markFailedSpy).toHaveBeenCalledWith(expect.any(String), error);
      expect(updateSpy).toHaveBeenCalledWith(
        expect.any(Number),
        'error',
        'Unlock failed',
      );
    });

    it('throws the error after handling', async () => {
      const sdk = getMockSdk();
      (sdk.unlockTokens as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Boom'));

      const { unlock } = useLockTokens('GYRI|Unit|none|none', 'GYRI');
      await expect(unlock('100')).rejects.toThrow('Boom');
    });
  });

  describe('independent loading states', () => {
    it('isLocking is independent from isUnlocking', async () => {
      const sdk = getMockSdk();
      let resolveLock: () => void;
      (sdk.lockTokens as ReturnType<typeof vi.fn>).mockImplementation(
        () => new Promise<void>((resolve) => { resolveLock = resolve; }),
      );
      (sdk.unlockTokens as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

      const tokenStore = useTokenStore();
      tokenStore.fetchBalances = vi.fn().mockResolvedValue(undefined);

      const { lock, isLocking, isUnlocking } = useLockTokens('GYRI|Unit|none|none', 'GYRI');

      const promise = lock('100');
      await vi.waitFor(() => {
        expect(isLocking.value).toBe(true);
      });
      expect(isUnlocking.value).toBe(false);

      resolveLock!();
      await promise;

      expect(isLocking.value).toBe(false);
      expect(isUnlocking.value).toBe(false);
    });

    it('isUnlocking is independent from isLocking', async () => {
      const sdk = getMockSdk();
      let resolveUnlock: () => void;
      (sdk.unlockTokens as ReturnType<typeof vi.fn>).mockImplementation(
        () => new Promise<void>((resolve) => { resolveUnlock = resolve; }),
      );
      (sdk.lockTokens as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

      const tokenStore = useTokenStore();
      tokenStore.fetchBalances = vi.fn().mockResolvedValue(undefined);

      const { unlock, isLocking, isUnlocking } = useLockTokens('GYRI|Unit|none|none', 'GYRI');

      const promise = unlock('100');
      await vi.waitFor(() => {
        expect(isUnlocking.value).toBe(true);
      });
      expect(isLocking.value).toBe(false);

      resolveUnlock!();
      await promise;

      expect(isUnlocking.value).toBe(false);
      expect(isLocking.value).toBe(false);
    });

    it('isLocking is false after lock error', async () => {
      const sdk = getMockSdk();
      (sdk.lockTokens as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('fail'));

      const { lock, isLocking } = useLockTokens('GYRI|Unit|none|none', 'GYRI');
      await expect(lock('50')).rejects.toThrow();

      expect(isLocking.value).toBe(false);
    });

    it('isUnlocking is false after unlock error', async () => {
      const sdk = getMockSdk();
      (sdk.unlockTokens as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('fail'));

      const { unlock, isUnlocking } = useLockTokens('GYRI|Unit|none|none', 'GYRI');
      await expect(unlock('50')).rejects.toThrow();

      expect(isUnlocking.value).toBe(false);
    });
  });
});
