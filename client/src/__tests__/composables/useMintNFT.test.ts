import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useMintNFT } from '@/composables/useMintNFT';
import type { MintNftResult, EstimateMintFeeParams, MintNftParams } from '@/composables/useMintNFT';
import { useSdkStore } from '@/stores/sdk';
import { useTransactionStore } from '@/stores/transactions';
import { useToastStore } from '@/stores/toasts';
import { useNftStore } from '@/stores/nfts';

function getMockSdk() {
  const sdkStore = useSdkStore();
  return sdkStore.sdk!;
}

const mockMintResult: MintNftResult = {
  transactionId: 'tx-hash-123',
  mintedQuantity: '5',
  owner: '0xABC',
  tokenInstances: [1, 2, 3, 4, 5],
  tokenClass: { collection: 'C', type: 'T', category: 'Cat' },
};

const mockMintParams: MintNftParams = {
  collection: 'TestCollection',
  type: 'Rare',
  category: 'Item',
  quantity: '5',
  ownerAddress: '0xABC',
};

const mockEstimateParams: EstimateMintFeeParams = {
  collection: 'TestCollection',
  type: 'Rare',
  category: 'Item',
  quantity: '5',
  ownerAddress: '0xABC',
};

describe('useMintNFT', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    const sdkStore = useSdkStore();
    sdkStore.initialize();
  });

  it('returns mint, estimateFee, isMinting, and mintFee', () => {
    const { mint, estimateFee, isMinting, mintFee } = useMintNFT();
    expect(typeof mint).toBe('function');
    expect(typeof estimateFee).toBe('function');
    expect(isMinting.value).toBe(false);
    expect(mintFee.value).toBe('');
  });

  describe('estimateFee', () => {
    it('calls sdk.estimateNftMintFee and sets mintFee', async () => {
      const sdk = getMockSdk();
      (sdk.estimateNftMintFee as ReturnType<typeof vi.fn>).mockResolvedValue('0.5');

      const { estimateFee, mintFee } = useMintNFT();
      await estimateFee(mockEstimateParams);

      expect(sdk.estimateNftMintFee).toHaveBeenCalledWith(mockEstimateParams);
      expect(mintFee.value).toBe('0.5');
    });

    it('sets mintFee to empty string and shows error toast on error', async () => {
      const sdk = getMockSdk();
      (sdk.estimateNftMintFee as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Fee estimation failed'));

      const toastStore = useToastStore();
      const errorSpy = vi.spyOn(toastStore, 'error');

      const { estimateFee, mintFee } = useMintNFT();

      // Set a previous value to verify it gets cleared
      mintFee.value = '1.0';

      await estimateFee(mockEstimateParams);

      expect(mintFee.value).toBe('');
      expect(errorSpy).toHaveBeenCalledWith('Fee estimation failed');
    });
  });

  describe('mint', () => {
    it('calls sdk.mintNft and returns the result', async () => {
      const sdk = getMockSdk();
      (sdk.mintNft as ReturnType<typeof vi.fn>).mockResolvedValue(mockMintResult);

      const nftStore = useNftStore();
      nftStore.fetchBalances = vi.fn().mockResolvedValue(undefined);

      const { mint } = useMintNFT();
      const result = await mint(mockMintParams);

      expect(sdk.mintNft).toHaveBeenCalledWith(mockMintParams);
      expect(result).toEqual(mockMintResult);
    });

    it('creates pending transaction and toast', async () => {
      const sdk = getMockSdk();
      (sdk.mintNft as ReturnType<typeof vi.fn>).mockResolvedValue(mockMintResult);

      const transactions = useTransactionStore();
      const toastStore = useToastStore();
      const nftStore = useNftStore();
      nftStore.fetchBalances = vi.fn().mockResolvedValue(undefined);

      const addPendingSpy = vi.spyOn(transactions, 'addPending');
      const pendingSpy = vi.spyOn(toastStore, 'pending');

      const { mint } = useMintNFT();
      await mint(mockMintParams);

      expect(addPendingSpy).toHaveBeenCalledWith('mint', 'Mint 5x TestCollection Rare');
      expect(pendingSpy).toHaveBeenCalledWith('Minting 5x TestCollection Rare...');
    });

    it('marks tx complete with result.transactionId on success', async () => {
      const sdk = getMockSdk();
      (sdk.mintNft as ReturnType<typeof vi.fn>).mockResolvedValue(mockMintResult);

      const transactions = useTransactionStore();
      const toastStore = useToastStore();
      const nftStore = useNftStore();
      nftStore.fetchBalances = vi.fn().mockResolvedValue(undefined);

      const markCompleteSpy = vi.spyOn(transactions, 'markComplete');
      const updateSpy = vi.spyOn(toastStore, 'update');

      const { mint } = useMintNFT();
      await mint(mockMintParams);

      expect(markCompleteSpy).toHaveBeenCalledWith(expect.any(String), 'tx-hash-123');
      expect(updateSpy).toHaveBeenCalledWith(
        expect.any(Number),
        'success',
        'Successfully minted 5x TestCollection Rare.',
      );
    });

    it('refreshes NFT balances on success', async () => {
      const sdk = getMockSdk();
      (sdk.mintNft as ReturnType<typeof vi.fn>).mockResolvedValue(mockMintResult);

      const nftStore = useNftStore();
      nftStore.fetchBalances = vi.fn().mockResolvedValue(undefined);

      const { mint } = useMintNFT();
      await mint(mockMintParams);

      expect(nftStore.fetchBalances).toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('marks tx failed and throws on mint error', async () => {
      const sdk = getMockSdk();
      const error = new Error('Mint failed');
      (sdk.mintNft as ReturnType<typeof vi.fn>).mockRejectedValue(error);

      const transactions = useTransactionStore();
      const toastStore = useToastStore();

      const markFailedSpy = vi.spyOn(transactions, 'markFailed');
      const updateSpy = vi.spyOn(toastStore, 'update');

      const { mint } = useMintNFT();

      await expect(mint(mockMintParams)).rejects.toThrow('Mint failed');

      expect(markFailedSpy).toHaveBeenCalledWith(expect.any(String), error);
      expect(updateSpy).toHaveBeenCalledWith(
        expect.any(Number),
        'error',
        'Mint failed',
      );
    });

    it('throws the error after handling', async () => {
      const sdk = getMockSdk();
      (sdk.mintNft as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Boom'));

      const { mint } = useMintNFT();

      await expect(mint(mockMintParams)).rejects.toThrow('Boom');
    });
  });

  describe('isMinting loading state', () => {
    it('is true during mint and false after success', async () => {
      const sdk = getMockSdk();
      let resolveMint: (value: MintNftResult) => void;
      (sdk.mintNft as ReturnType<typeof vi.fn>).mockImplementation(
        () => new Promise<MintNftResult>((resolve) => { resolveMint = resolve; }),
      );

      const nftStore = useNftStore();
      nftStore.fetchBalances = vi.fn().mockResolvedValue(undefined);

      const { mint, isMinting } = useMintNFT();

      expect(isMinting.value).toBe(false);

      const promise = mint(mockMintParams);
      await vi.waitFor(() => {
        expect(isMinting.value).toBe(true);
      });

      resolveMint!(mockMintResult);
      await promise;

      expect(isMinting.value).toBe(false);
    });

    it('is false after error', async () => {
      const sdk = getMockSdk();
      (sdk.mintNft as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('fail'));

      const { mint, isMinting } = useMintNFT();

      await expect(mint(mockMintParams)).rejects.toThrow();

      expect(isMinting.value).toBe(false);
    });
  });
});
