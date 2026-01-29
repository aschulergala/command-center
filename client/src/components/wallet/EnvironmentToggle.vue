<script setup lang="ts">
import { useSdk } from '@/composables/useSdk';
import { useWalletStore } from '@/stores/wallet';
import type { GalaEnvironment } from '@/lib/config';

const { env, switchEnvironment } = useSdk();
const walletStore = useWalletStore();

function toggle() {
  const newEnv: GalaEnvironment = env.value === 'PROD' ? 'STAGE' : 'PROD';
  switchEnvironment(newEnv, walletStore.walletProvider ?? undefined);
}
</script>

<template>
  <button
    class="flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors"
    :class="env === 'PROD'
      ? 'border-emerald-800 bg-emerald-950 text-emerald-400 hover:bg-emerald-900'
      : 'border-amber-800 bg-amber-950 text-amber-400 hover:bg-amber-900'"
    @click="toggle"
  >
    <span
      class="inline-block h-1.5 w-1.5 rounded-full"
      :class="env === 'PROD' ? 'bg-emerald-500' : 'bg-amber-500'"
    />
    {{ env }}
  </button>
</template>
