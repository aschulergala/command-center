import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useBurnNFT } from '@/composables/useBurnNFT';
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

describe('useBurnNFT', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    const sdkStore = useSdkStore();
    sdkStore.initialize();
  });

  it('returns burn function and isBurning ref', () => {
    const { burn, isBurning } = useBurnNFT(mockNft);
    expect(typeof burn).toBe('function');
    expect(isBurning.value).toBe(false);
  });

  describe('burn', () => {
    it('calls sdk.burnTokens with tokenName built from nft parts and amount 1', async () => {
      const sdk = getMockSdk();
      (sdk.burnTokens as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

      const nftStore = useNftStore();
      nftStore.fetchBalances = vi.fn().mockResolvedValue(undefined);

      const { burn } = useBurnNFT(mockNft);
      await burn('1');

      expect(sdk.burnTokens).toHaveBeenCalledWith({
        tokens: [{ tokenName: 'TestNFT|Weapon|Sword|none', amount: '1' }],
      });
    });

    it('creates pending transaction and toast referencing the NFT', async () => {
      const sdk = getMockSdk();
      (sdk.burnTokens as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

      const transactions = useTransactionStore();
      const toastStore = useToastStore();
      const nftStore = useNftStore();
      nftStore.fetchBalances = vi.fn().mockResolvedValue(undefined);

      const addPendingSpy = vi.spyOn(transactions, 'addPending');
      const pendingSpy = vi.spyOn(toastStore, 'pending');

      const { burn } = useBurnNFT(mockNft);
      await burn('42');

      expect(addPendingSpy).toHaveBeenCalledWith('burn', 'Burn TestNFT Sword #42');
      expect(pendingSpy).toHaveBeenCalledWith('Burning TestNFT Sword #42...');
    });

    it('marks tx complete and updates toast on success', async () => {
      const sdk = getMockSdk();
      (sdk.burnTokens as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

      const transactions = useTransactionStore();
      const toastStore = useToastStore();
      const nftStore = useNftStore();
      nftStore.fetchBalances = vi.fn().mockResolvedValue(undefined);

      const markCompleteSpy = vi.spyOn(transactions, 'markComplete');
      const updateSpy = vi.spyOn(toastStore, 'update');

      const { burn } = useBurnNFT(mockNft);
      await burn('1');

      expect(markCompleteSpy).toHaveBeenCalledWith(expect.any(String));
      expect(updateSpy).toHaveBeenCalledWith(
        expect.any(Number),
        'success',
        'Successfully burned TestNFT Sword #1.',
      );
    });

    it('refreshes NFT balances on success', async () => {
      const sdk = getMockSdk();
      (sdk.burnTokens as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

      const nftStore = useNftStore();
      nftStore.fetchBalances = vi.fn().mockResolvedValue(undefined);

      const { burn } = useBurnNFT(mockNft);
      await burn('1');

      expect(nftStore.fetchBalances).toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('marks tx failed and updates toast to error on failure', async () => {
      const sdk = getMockSdk();
      const error = new Error('Burn NFT failed');
      (sdk.burnTokens as ReturnType<typeof vi.fn>).mockRejectedValue(error);

      const transactions = useTransactionStore();
      const toastStore = useToastStore();

      const markFailedSpy = vi.spyOn(transactions, 'markFailed');
      const updateSpy = vi.spyOn(toastStore, 'update');

      const { burn } = useBurnNFT(mockNft);

      await expect(burn('1')).rejects.toThrow('Burn NFT failed');

      expect(markFailedSpy).toHaveBeenCalledWith(expect.any(String), error);
      expect(updateSpy).toHaveBeenCalledWith(
        expect.any(Number),
        'error',
        'Burn NFT failed',
      );
    });

    it('throws the error after handling', async () => {
      const sdk = getMockSdk();
      (sdk.burnTokens as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Boom'));

      const { burn } = useBurnNFT(mockNft);

      await expect(burn('1')).rejects.toThrow('Boom');
    });
  });

  describe('isBurning loading state', () => {
    it('is true during burn and false after success', async () => {
      const sdk = getMockSdk();
      let resolveBurn: () => void;
      (sdk.burnTokens as ReturnType<typeof vi.fn>).mockImplementation(
        () => new Promise<void>((resolve) => { resolveBurn = resolve; }),
      );

      const nftStore = useNftStore();
      nftStore.fetchBalances = vi.fn().mockResolvedValue(undefined);

      const { burn, isBurning } = useBurnNFT(mockNft);

      expect(isBurning.value).toBe(false);

      const promise = burn('1');
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

      const { burn, isBurning } = useBurnNFT(mockNft);

      await expect(burn('1')).rejects.toThrow();

      expect(isBurning.value).toBe(false);
    });
  });
});
