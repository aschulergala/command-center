import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useTransferNFT } from '@/composables/useTransferNFT';
import { useSdkStore } from '@/stores/sdk';
import { useTransactionStore } from '@/stores/transactions';
import { useToastStore } from '@/stores/toasts';
import { useNftStore } from '@/stores/nfts';
import type { NftBalance } from '@/stores/nfts';

function getMockSdk() {
  const sdkStore = useSdkStore();
  return sdkStore.sdk!;
}

const mockNft: NftBalance = {
  owner: '0xABC',
  collection: 'TestNFT',
  category: 'Weapon',
  type: 'Sword',
  additionalKey: 'none',
  instanceIds: ['1', '2', '3'],
  totalOwned: 3,
};

describe('useTransferNFT', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    const sdkStore = useSdkStore();
    sdkStore.initialize();
  });

  it('returns transfer function and isTransferring ref', () => {
    const { transfer, isTransferring } = useTransferNFT(mockNft);
    expect(typeof transfer).toBe('function');
    expect(isTransferring.value).toBe(false);
  });

  describe('transfer', () => {
    it('calls sdk.transferToken with tokenName built from nft parts and amount 1', async () => {
      const sdk = getMockSdk();
      (sdk.transferToken as ReturnType<typeof vi.fn>).mockResolvedValue('tx-hash-nft');

      const nftStore = useNftStore();
      nftStore.fetchBalances = vi.fn().mockResolvedValue(undefined);

      const { transfer } = useTransferNFT(mockNft);
      await transfer('0xRecipient', '1');

      expect(sdk.transferToken).toHaveBeenCalledWith({
        to: '0xRecipient',
        tokenName: 'TestNFT|Weapon|Sword|none',
        amount: '1',
      });
    });

    it('creates pending transaction and toast referencing the NFT name and instance', async () => {
      const sdk = getMockSdk();
      (sdk.transferToken as ReturnType<typeof vi.fn>).mockResolvedValue('tx-hash-nft');

      const transactions = useTransactionStore();
      const toastStore = useToastStore();
      const nftStore = useNftStore();
      nftStore.fetchBalances = vi.fn().mockResolvedValue(undefined);

      const addPendingSpy = vi.spyOn(transactions, 'addPending');
      const pendingSpy = vi.spyOn(toastStore, 'pending');

      const { transfer } = useTransferNFT(mockNft);
      await transfer('0xRecipient', '42');

      expect(addPendingSpy).toHaveBeenCalledWith('transfer', 'Transfer TestNFT Sword #42');
      expect(pendingSpy).toHaveBeenCalledWith('Transferring TestNFT Sword #42...');
    });

    it('marks tx complete with txHash and updates toast on success', async () => {
      const sdk = getMockSdk();
      (sdk.transferToken as ReturnType<typeof vi.fn>).mockResolvedValue('tx-hash-nft');

      const transactions = useTransactionStore();
      const toastStore = useToastStore();
      const nftStore = useNftStore();
      nftStore.fetchBalances = vi.fn().mockResolvedValue(undefined);

      const markCompleteSpy = vi.spyOn(transactions, 'markComplete');
      const updateSpy = vi.spyOn(toastStore, 'update');

      const { transfer } = useTransferNFT(mockNft);
      await transfer('0xRecipient', '1');

      expect(markCompleteSpy).toHaveBeenCalledWith(expect.any(String), 'tx-hash-nft');
      expect(updateSpy).toHaveBeenCalledWith(
        expect.any(Number),
        'success',
        'Successfully transferred TestNFT Sword #1.',
      );
    });

    it('refreshes NFT balances (not token balances) on success', async () => {
      const sdk = getMockSdk();
      (sdk.transferToken as ReturnType<typeof vi.fn>).mockResolvedValue('tx-hash-nft');

      const nftStore = useNftStore();
      nftStore.fetchBalances = vi.fn().mockResolvedValue(undefined);

      const { transfer } = useTransferNFT(mockNft);
      await transfer('0xRecipient', '1');

      expect(nftStore.fetchBalances).toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('marks tx failed and updates toast to error on failure', async () => {
      const sdk = getMockSdk();
      const error = new Error('Transfer NFT failed');
      (sdk.transferToken as ReturnType<typeof vi.fn>).mockRejectedValue(error);

      const transactions = useTransactionStore();
      const toastStore = useToastStore();

      const markFailedSpy = vi.spyOn(transactions, 'markFailed');
      const updateSpy = vi.spyOn(toastStore, 'update');

      const { transfer } = useTransferNFT(mockNft);

      await expect(transfer('0xRecipient', '1')).rejects.toThrow('Transfer NFT failed');

      expect(markFailedSpy).toHaveBeenCalledWith(expect.any(String), error);
      expect(updateSpy).toHaveBeenCalledWith(
        expect.any(Number),
        'error',
        'Transfer NFT failed',
      );
    });

    it('throws the error after handling', async () => {
      const sdk = getMockSdk();
      (sdk.transferToken as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Boom'));

      const { transfer } = useTransferNFT(mockNft);

      await expect(transfer('0xRecipient', '1')).rejects.toThrow('Boom');
    });
  });

  describe('isTransferring loading state', () => {
    it('is true during transfer and false after success', async () => {
      const sdk = getMockSdk();
      let resolveTransfer: (value: string) => void;
      (sdk.transferToken as ReturnType<typeof vi.fn>).mockImplementation(
        () => new Promise<string>((resolve) => { resolveTransfer = resolve; }),
      );

      const nftStore = useNftStore();
      nftStore.fetchBalances = vi.fn().mockResolvedValue(undefined);

      const { transfer, isTransferring } = useTransferNFT(mockNft);

      expect(isTransferring.value).toBe(false);

      const promise = transfer('0xRecipient', '1');
      await vi.waitFor(() => {
        expect(isTransferring.value).toBe(true);
      });

      resolveTransfer!('tx-hash');
      await promise;

      expect(isTransferring.value).toBe(false);
    });

    it('is false after error', async () => {
      const sdk = getMockSdk();
      (sdk.transferToken as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('fail'));

      const { transfer, isTransferring } = useTransferNFT(mockNft);

      await expect(transfer('0xRecipient', '1')).rejects.toThrow();

      expect(isTransferring.value).toBe(false);
    });
  });
});
