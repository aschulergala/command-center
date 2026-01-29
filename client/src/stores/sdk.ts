import { defineStore } from 'pinia';
import { shallowRef, ref } from 'vue';
import { LaunchpadSDK } from '@gala-chain/launchpad-sdk';
import type { WalletProvider } from '@gala-chain/launchpad-sdk';
import { createSDK } from '@/lib/sdk';
import { DEFAULT_ENV, ENV_STORAGE_KEY } from '@/lib/config';
import type { GalaEnvironment } from '@/lib/config';

export const useSdkStore = defineStore('sdk', () => {
  const sdk = shallowRef<LaunchpadSDK | null>(null);
  const stored = localStorage.getItem(ENV_STORAGE_KEY);
  const validEnvs: GalaEnvironment[] = ['PROD', 'STAGE'];
  const initialEnv: GalaEnvironment = stored && validEnvs.includes(stored as GalaEnvironment)
    ? (stored as GalaEnvironment)
    : DEFAULT_ENV;
  const env = ref<GalaEnvironment>(initialEnv);
  const isInitialized = ref(false);

  function initialize(walletProvider?: WalletProvider) {
    // Clean up previous instance
    if (sdk.value) {
      try {
        sdk.value.cleanup();
      } catch {
        // ignore cleanup errors
      }
    }

    sdk.value = createSDK(env.value, walletProvider);
    isInitialized.value = true;
  }

  function switchEnvironment(newEnv: GalaEnvironment, walletProvider?: WalletProvider) {
    env.value = newEnv;
    localStorage.setItem(ENV_STORAGE_KEY, newEnv);
    initialize(walletProvider);
  }

  function requireSdk(): LaunchpadSDK {
    if (!sdk.value) {
      throw new Error('SDK not initialized');
    }
    return sdk.value;
  }

  // Initialize read-only SDK immediately
  initialize();

  return {
    sdk,
    env,
    isInitialized,
    initialize,
    switchEnvironment,
    requireSdk,
  };
});
