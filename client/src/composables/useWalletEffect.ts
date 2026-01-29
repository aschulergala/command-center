import { onMounted, watch } from 'vue';
import { useWalletStore } from '@/stores/wallet';

export function useWalletEffect(onConnect: () => void, onDisconnect?: () => void) {
  const walletStore = useWalletStore();

  onMounted(() => {
    if (walletStore.isConnected) {
      onConnect();
    }
  });

  watch(() => walletStore.isConnected, (connected) => {
    if (connected) {
      onConnect();
    } else if (onDisconnect) {
      onDisconnect();
    }
  });
}
