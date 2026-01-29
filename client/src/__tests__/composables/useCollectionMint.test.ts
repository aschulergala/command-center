import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useCollectionMint } from '@/composables/useCollectionMint';
import type { MintNftParams, EstimateMintFeeParams } from '@/composables/useCollectionMint';
import { useSdkStore } from '@/stores/sdk';
import { useTransactionStore } from '@/stores/transactions';
import { useToastStore } from '@/stores/toasts';
import { useCreatorStore } from '@/stores/creators';

function getMockSdk() {
  const sdkStore = useSdkStore();
  return sdkStore.sdk!;
}

const mockMintParams: MintNftParams = {
  collection: 'TestCollection',
  type: 'Sword',
  category: 'Weapon',
  quantity: '10',
  ownerAddress: '0xABC',
};

const mockEstimateParams: EstimateMintFeeParams = {
  collection: 'TestCollection',
  type: 'Sword',
  category: 'Weapon',
  quantity: '10',
  ownerAddress: '0xABC',
};

const mockMintResult = {
  transactionId: 'tx-mint-123',
  mintedQuantity: '10',
  owner: '0xABC',
  tokenInstances: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  tokenClass: { collection: 'TestCollection', type: 'Sword', category: 'Weapon' },
};

describe('useCollectionMint', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    const sdkStore = useSdkStore();
    sdkStore.initialize();
  });

  it('returns all expected properties', () => {
    const { isMinting, mintFee, isEstimating, estimateFee, mint, resetFee } = useCollectionMint();
    expect(typeof estimateFee).toBe('function');
    expect(typeof mint).toBe('function');
    expect(typeof resetFee).toBe('function');
    expect(isMinting.value).toBe(false);
    expect(mintFee.value).toBe('');
    expect(isEstimating.value).toBe(false);
  });

  describe('estimateFee', () => {
    it('calls sdk.estimateNftMintFee and sets mintFee', async () => {
      const sdk = getMockSdk();
      (sdk.estimateNftMintFee as ReturnType<typeof vi.fn>).mockResolvedValue('1.5');

      const { estimateFee, mintFee } = useCollectionMint();
      await estimateFee(mockEstimateParams);

      expect(sdk.estimateNftMintFee).toHaveBeenCalledWith(mockEstimateParams);
      expect(mintFee.value).toBe('1.5');
    });

    it('sets mintFee to empty string on error', async () => {
      const sdk = getMockSdk();
      (sdk.estimateNftMintFee as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Fee error'),
      );

      const { estimateFee, mintFee } = useCollectionMint();

      // Set a previous value to verify it gets cleared
      mintFee.value = '2.0';

      await estimateFee(mockEstimateParams);

      expect(mintFee.value).toBe('');
    });

    it('manages isEstimating loading state', async () => {
      const sdk = getMockSdk();
      let resolveEstimate: (value: string) => void;
      (sdk.estimateNftMintFee as ReturnType<typeof vi.fn>).mockImplementation(
        () => new Promise<string>((resolve) => { resolveEstimate = resolve; }),
      );

      const { estimateFee, isEstimating } = useCollectionMint();

      expect(isEstimating.value).toBe(false);

      const promise = estimateFee(mockEstimateParams);
      await vi.waitFor(() => {
        expect(isEstimating.value).toBe(true);
      });

      resolveEstimate!('1.0');
      await promise;

      expect(isEstimating.value).toBe(false);
    });

    it('isEstimating is false after error', async () => {
      const sdk = getMockSdk();
      (sdk.estimateNftMintFee as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('fail'));

      const { estimateFee, isEstimating } = useCollectionMint();

      await estimateFee(mockEstimateParams);

      expect(isEstimating.value).toBe(false);
    });
  });

  describe('mint', () => {
    it('calls sdk.mintNft with params', async () => {
      const sdk = getMockSdk();
      (sdk.mintNft as ReturnType<typeof vi.fn>).mockResolvedValue(mockMintResult);

      const { mint } = useCollectionMint();
      await mint(mockMintParams);

      expect(sdk.mintNft).toHaveBeenCalledWith(mockMintParams);
    });

    it('creates pending transaction and toast', async () => {
      const sdk = getMockSdk();
      (sdk.mintNft as ReturnType<typeof vi.fn>).mockResolvedValue(mockMintResult);

      const transactions = useTransactionStore();
      const toastStore = useToastStore();

      const addPendingSpy = vi.spyOn(transactions, 'addPending');
      const pendingSpy = vi.spyOn(toastStore, 'pending');

      const { mint } = useCollectionMint();
      await mint(mockMintParams);

      expect(addPendingSpy).toHaveBeenCalledWith('mint', 'Mint 10 NFTs');
      expect(pendingSpy).toHaveBeenCalledWith('Minting 10 NFTs...');
    });

    it('marks tx complete with transactionId and updates toast on success', async () => {
      const sdk = getMockSdk();
      (sdk.mintNft as ReturnType<typeof vi.fn>).mockResolvedValue(mockMintResult);

      const transactions = useTransactionStore();
      const toastStore = useToastStore();

      const markCompleteSpy = vi.spyOn(transactions, 'markComplete');
      const updateSpy = vi.spyOn(toastStore, 'update');

      const { mint } = useCollectionMint();
      await mint(mockMintParams);

      expect(markCompleteSpy).toHaveBeenCalledWith(expect.any(String), 'tx-mint-123');
      expect(updateSpy).toHaveBeenCalledWith(
        expect.any(Number),
        'success',
        'Successfully minted 10 NFTs.',
      );
    });

    it('refreshes token classes when selectedCollection is set', async () => {
      const sdk = getMockSdk();
      (sdk.mintNft as ReturnType<typeof vi.fn>).mockResolvedValue(mockMintResult);

      const creatorStore = useCreatorStore();
      creatorStore.selectedCollection = {
        authorizedUser: '0xABC',
        collection: 'TestCollection',
      };
      creatorStore.fetchTokenClasses = vi.fn().mockResolvedValue(undefined);

      const { mint } = useCollectionMint();
      await mint(mockMintParams);

      expect(creatorStore.fetchTokenClasses).toHaveBeenCalledWith('TestCollection');
    });

    it('does not refresh token classes when selectedCollection is not set', async () => {
      const sdk = getMockSdk();
      (sdk.mintNft as ReturnType<typeof vi.fn>).mockResolvedValue(mockMintResult);

      const creatorStore = useCreatorStore();
      creatorStore.selectedCollection = null;
      creatorStore.fetchTokenClasses = vi.fn().mockResolvedValue(undefined);

      const { mint } = useCollectionMint();
      await mint(mockMintParams);

      expect(creatorStore.fetchTokenClasses).not.toHaveBeenCalled();
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

      const { mint } = useCollectionMint();

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

      const { mint } = useCollectionMint();

      await expect(mint(mockMintParams)).rejects.toThrow('Boom');
    });
  });

  describe('isMinting loading state', () => {
    it('is true during mint and false after success', async () => {
      const sdk = getMockSdk();
      let resolveMint: (value: typeof mockMintResult) => void;
      (sdk.mintNft as ReturnType<typeof vi.fn>).mockImplementation(
        () => new Promise((resolve) => { resolveMint = resolve; }),
      );

      const { mint, isMinting } = useCollectionMint();

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

      const { mint, isMinting } = useCollectionMint();

      await expect(mint(mockMintParams)).rejects.toThrow();

      expect(isMinting.value).toBe(false);
    });
  });

  describe('resetFee', () => {
    it('sets mintFee to empty string', async () => {
      const sdk = getMockSdk();
      (sdk.estimateNftMintFee as ReturnType<typeof vi.fn>).mockResolvedValue('2.5');

      const { estimateFee, mintFee, resetFee } = useCollectionMint();

      await estimateFee(mockEstimateParams);
      expect(mintFee.value).toBe('2.5');

      resetFee();
      expect(mintFee.value).toBe('');
    });
  });
});
