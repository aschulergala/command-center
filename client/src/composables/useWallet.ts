import { computed } from 'vue';
import { useWalletStore } from '@/stores/wallet';

export function useWallet() {
  const store = useWalletStore();

  return {
    address: computed(() => store.address),
    galaAddress: computed(() => store.galaAddress),
    isConnected: computed(() => store.isConnected),
    isConnecting: computed(() => store.isConnecting),
    shortAddress: computed(() => store.shortAddress),
    detectedWallets: computed(() => store.detectedWallets),
    error: computed(() => store.error),
    connect: store.connect,
    disconnect: store.disconnect,
    detect: store.detect,
    autoReconnect: store.autoReconnect,
  };
}
