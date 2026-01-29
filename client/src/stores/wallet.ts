import { defineStore } from 'pinia';
import { ref, shallowRef, computed } from 'vue';
import {
  ExternalWalletProvider,
  detectWallets,
} from '@gala-chain/launchpad-sdk';
import type {
  WalletProvider,
  DetectedWallet,
} from '@gala-chain/launchpad-sdk';
import { useSdkStore } from './sdk';
import { WALLET_CONNECTED_KEY } from '@/lib/config';
import { parseError } from '@/lib/errors';

export const useWalletStore = defineStore('wallet', () => {
  const walletProvider = shallowRef<WalletProvider | null>(null);
  const detectedWallets = shallowRef<DetectedWallet[]>([]);
  const address = ref<string | null>(null);
  const galaAddress = ref<string | null>(null);
  const isConnecting = ref(false);
  const isDetecting = ref(false);
  const error = ref<string | null>(null);

  const isConnected = computed(() => address.value !== null);
  const shortAddress = computed(() => {
    if (!address.value) return null;
    return `${address.value.slice(0, 6)}...${address.value.slice(-4)}`;
  });

  async function detect() {
    if (isDetecting.value) return;
    isDetecting.value = true;
    try {
      const result = await detectWallets(1000);
      detectedWallets.value = result.wallets;
    } catch {
      detectedWallets.value = [];
    } finally {
      isDetecting.value = false;
    }
  }

  async function connect(wallet: DetectedWallet) {
    if (isConnecting.value) return;
    isConnecting.value = true;
    error.value = null;

    try {
      const provider = new ExternalWalletProvider(wallet.provider);
      const addr = await provider.connect();

      walletProvider.value = provider;
      address.value = addr;
      galaAddress.value = await provider.getGalaAddress();

      // Re-init SDK with wallet
      const sdkStore = useSdkStore();
      sdkStore.initialize(provider);

      // Persist connection preference
      localStorage.setItem(WALLET_CONNECTED_KEY, wallet.rdns);

      // Listen for account changes
      if (typeof wallet.provider.on === 'function') {
        wallet.provider.on('accountsChanged', handleAccountsChanged as (...args: unknown[]) => void);
      }
    } catch (err) {
      error.value = parseError(err);
      throw err;
    } finally {
      isConnecting.value = false;
    }
  }

  function handleAccountsChanged(accounts: string[]) {
    if (accounts.length === 0) {
      disconnect();
    } else {
      address.value = accounts[0];
    }
  }

  async function disconnect() {
    if (walletProvider.value) {
      try {
        await walletProvider.value.disconnect();
      } catch {
        // ignore
      }
    }

    walletProvider.value = null;
    address.value = null;
    galaAddress.value = null;
    localStorage.removeItem(WALLET_CONNECTED_KEY);

    // Re-init SDK without wallet (read-only)
    const sdkStore = useSdkStore();
    sdkStore.initialize();
  }

  async function autoReconnect() {
    const savedRdns = localStorage.getItem(WALLET_CONNECTED_KEY);
    if (!savedRdns) return;

    await detect();

    const wallet = detectedWallets.value.find((w) => w.rdns === savedRdns);
    if (wallet) {
      try {
        await connect(wallet);
      } catch {
        // Auto-reconnect failed silently
        localStorage.removeItem(WALLET_CONNECTED_KEY);
      }
    }
  }

  // Detect wallets on store creation
  detect();

  return {
    walletProvider,
    detectedWallets,
    address,
    galaAddress,
    isConnected,
    isConnecting,
    isDetecting,
    shortAddress,
    error,
    detect,
    connect,
    disconnect,
    autoReconnect,
  };
});
