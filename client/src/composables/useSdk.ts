import { computed } from 'vue';
import { useSdkStore } from '@/stores/sdk';

export function useSdk() {
  const store = useSdkStore();

  return {
    sdk: computed(() => store.sdk),
    env: computed(() => store.env),
    isInitialized: computed(() => store.isInitialized),
    requireSdk: () => store.requireSdk(),
    switchEnvironment: store.switchEnvironment,
  };
}
