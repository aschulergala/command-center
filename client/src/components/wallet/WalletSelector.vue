<script setup lang="ts">
import type { DetectedWallet } from '@gala-chain/launchpad-sdk';

defineProps<{
  wallets: DetectedWallet[];
  isConnecting: boolean;
}>();

const emit = defineEmits<{
  select: [wallet: DetectedWallet];
  close: [];
}>();
</script>

<template>
  <div class="space-y-2">
    <div class="flex items-center justify-between pb-2">
      <h3 class="text-sm font-semibold text-white">Select Wallet</h3>
      <button
        class="text-surface-400 hover:text-white"
        @click="emit('close')"
      >
        <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
        </svg>
      </button>
    </div>

    <div v-if="wallets.length === 0" class="py-4 text-center text-sm text-surface-500">
      No wallets detected. Please install a browser wallet extension.
    </div>

    <button
      v-for="wallet in wallets"
      :key="wallet.id"
      class="flex w-full items-center gap-3 rounded-lg border border-surface-700 bg-surface-800 px-3 py-3 text-left transition-colors hover:border-surface-600 hover:bg-surface-700 disabled:cursor-not-allowed disabled:opacity-50"
      :disabled="isConnecting"
      @click="emit('select', wallet)"
    >
      <img
        :src="wallet.icon"
        :alt="wallet.name"
        class="h-8 w-8 rounded-lg"
      />
      <div class="flex-1">
        <div class="text-sm font-medium text-white">{{ wallet.name }}</div>
        <div class="text-xs text-surface-500">{{ wallet.rdns }}</div>
      </div>
      <div v-if="isConnecting" class="h-4 w-4 animate-spin rounded-full border-2 border-surface-600 border-t-gala-500" />
    </button>
  </div>
</template>
