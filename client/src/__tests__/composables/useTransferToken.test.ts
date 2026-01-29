import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useTransferToken } from '@/composables/useTransferToken';
import { useSdkStore } from '@/stores/sdk';
import { useTransactionStore } from '@/stores/transactions';
import { useToastStore } from '@/stores/toasts';
import { useTokenStore } from '@/stores/tokens';

function getMockSdk() {
  const sdkStore = useSdkStore();
  return sdkStore.sdk!;
}

describe('useTransferToken', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    const sdkStore = useSdkStore();
    sdkStore.initialize();
  });

  it('returns transfer function and isTransferring ref', () => {
    const { transfer, isTransferring } = useTransferToken('TOKEN|Unit|none|none', 'TOKEN');
    expect(typeof transfer).toBe('function');
    expect(isTransferring.value).toBe(false);
  });

  describe('transfer with GALA token', () => {
    it('calls sdk.transferGala for GALA token id', async () => {
      const sdk = getMockSdk();
      (sdk.transferGala as ReturnType<typeof vi.fn>).mockResolvedValue('tx-hash-gala');

      const tokenStore = useTokenStore();
      tokenStore.fetchBalances = vi.fn().mockResolvedValue(undefined);

      const { transfer } = useTransferToken('GALA|Unit|none|none', 'GALA');
      await transfer('0xRecipient', '100');

      expect(sdk.transferGala).toHaveBeenCalledWith({
        recipientAddress: '0xRecipient',
        amount: '100',
      });
      expect(sdk.transferToken).not.toHaveBeenCalled();
    });

    it('creates pending transaction and toast before the call', async () => {
      const sdk = getMockSdk();
      (sdk.transferGala as ReturnType<typeof vi.fn>).mockResolvedValue('tx-hash-gala');

      const transactions = useTransactionStore();
      const toastStore = useToastStore();
      const tokenStore = useTokenStore();
      tokenStore.fetchBalances = vi.fn().mockResolvedValue(undefined);

      const addPendingSpy = vi.spyOn(transactions, 'addPending');
      const pendingSpy = vi.spyOn(toastStore, 'pending');

      const { transfer } = useTransferToken('GALA|Unit|none|none', 'GALA');
      await transfer('0xRecipient', '50');

      expect(addPendingSpy).toHaveBeenCalledWith('transfer', 'Transfer GALA');
      expect(pendingSpy).toHaveBeenCalledWith('Transferring 50 GALA...');
    });

    it('marks tx complete and updates toast on success', async () => {
      const sdk = getMockSdk();
      (sdk.transferGala as ReturnType<typeof vi.fn>).mockResolvedValue('tx-hash-gala');

      const transactions = useTransactionStore();
      const toastStore = useToastStore();
      const tokenStore = useTokenStore();
      tokenStore.fetchBalances = vi.fn().mockResolvedValue(undefined);

      const markCompleteSpy = vi.spyOn(transactions, 'markComplete');
      const updateSpy = vi.spyOn(toastStore, 'update');

      const { transfer } = useTransferToken('GALA|Unit|none|none', 'GALA');
      await transfer('0xRecipient', '50');

      expect(markCompleteSpy).toHaveBeenCalledWith(expect.any(String), 'tx-hash-gala');
      expect(updateSpy).toHaveBeenCalledWith(
        expect.any(Number),
        'success',
        'Successfully transferred 50 GALA.',
      );
    });

    it('refreshes token balances on success', async () => {
      const sdk = getMockSdk();
      (sdk.transferGala as ReturnType<typeof vi.fn>).mockResolvedValue('tx-hash-gala');

      const tokenStore = useTokenStore();
      tokenStore.fetchBalances = vi.fn().mockResolvedValue(undefined);

      const { transfer } = useTransferToken('GALA|Unit|none|none', 'GALA');
      await transfer('0xRecipient', '50');

      expect(tokenStore.fetchBalances).toHaveBeenCalled();
    });
  });

  describe('transfer with non-GALA token', () => {
    it('calls sdk.transferToken for non-GALA token ids', async () => {
      const sdk = getMockSdk();
      (sdk.transferToken as ReturnType<typeof vi.fn>).mockResolvedValue('tx-hash-token');

      const tokenStore = useTokenStore();
      tokenStore.fetchBalances = vi.fn().mockResolvedValue(undefined);

      const { transfer } = useTransferToken('GYRI|Unit|none|none', 'GYRI');
      await transfer('0xRecipient', '200');

      expect(sdk.transferToken).toHaveBeenCalledWith({
        to: '0xRecipient',
        tokenName: 'GYRI|Unit|none|none',
        amount: '200',
      });
      expect(sdk.transferGala).not.toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('marks tx failed and updates toast to error on failure', async () => {
      const sdk = getMockSdk();
      const error = new Error('Transfer failed');
      (sdk.transferGala as ReturnType<typeof vi.fn>).mockRejectedValue(error);

      const transactions = useTransactionStore();
      const toastStore = useToastStore();

      const markFailedSpy = vi.spyOn(transactions, 'markFailed');
      const updateSpy = vi.spyOn(toastStore, 'update');

      const { transfer } = useTransferToken('GALA|Unit|none|none', 'GALA');

      await expect(transfer('0xRecipient', '50')).rejects.toThrow('Transfer failed');

      expect(markFailedSpy).toHaveBeenCalledWith(expect.any(String), error);
      expect(updateSpy).toHaveBeenCalledWith(
        expect.any(Number),
        'error',
        'Transfer failed',
      );
    });

    it('throws the error after handling', async () => {
      const sdk = getMockSdk();
      (sdk.transferToken as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Boom'));

      const { transfer } = useTransferToken('GYRI|Unit|none|none', 'GYRI');

      await expect(transfer('0xRecipient', '10')).rejects.toThrow('Boom');
    });
  });

  describe('isTransferring loading state', () => {
    it('is true during transfer and false after success', async () => {
      const sdk = getMockSdk();
      let resolveTransfer: (value: string) => void;
      (sdk.transferGala as ReturnType<typeof vi.fn>).mockImplementation(
        () => new Promise<string>((resolve) => { resolveTransfer = resolve; }),
      );

      const tokenStore = useTokenStore();
      tokenStore.fetchBalances = vi.fn().mockResolvedValue(undefined);

      const { transfer, isTransferring } = useTransferToken('GALA|Unit|none|none', 'GALA');

      expect(isTransferring.value).toBe(false);

      const promise = transfer('0xRecipient', '50');
      // After calling transfer but before it resolves, isTransferring should be true
      await vi.waitFor(() => {
        expect(isTransferring.value).toBe(true);
      });

      resolveTransfer!('tx-hash');
      await promise;

      expect(isTransferring.value).toBe(false);
    });

    it('is false after error', async () => {
      const sdk = getMockSdk();
      (sdk.transferGala as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('fail'));

      const { transfer, isTransferring } = useTransferToken('GALA|Unit|none|none', 'GALA');

      await expect(transfer('0xRecipient', '50')).rejects.toThrow();

      expect(isTransferring.value).toBe(false);
    });
  });
});
