<script setup lang="ts">
import { ref } from 'vue';
import { useWallet } from '@/composables/useWallet';
import type { DetectedWallet } from '@gala-chain/launchpad-sdk';
import WalletSelector from './WalletSelector.vue';

const {
  isConnected,
  isConnecting,
  shortAddress,
  detectedWallets,
  error,
  connect,
  disconnect,
} = useWallet();

const showSelector = ref(false);
const showDropdown = ref(false);

async function handleSelect(wallet: DetectedWallet) {
  try {
    await connect(wallet);
    showSelector.value = false;
  } catch {
    // error is displayed in UI
  }
}

function handleDisconnect() {
  disconnect();
  showDropdown.value = false;
}
</script>

<template>
  <div class="relative">
    <!-- Connected state -->
    <button
      v-if="isConnected"
      class="btn-secondary text-xs"
      @click="showDropdown = !showDropdown"
    >
      <span class="inline-block h-2 w-2 rounded-full bg-emerald-500" />
      {{ shortAddress }}
    </button>

    <!-- Disconnected state -->
    <button
      v-else
      class="btn-primary text-xs"
      :disabled="isConnecting"
      @click="showSelector = !showSelector"
    >
      <template v-if="isConnecting">
        <span class="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
        Connecting...
      </template>
      <template v-else>
        Connect Wallet
      </template>
    </button>

    <!-- Wallet selector dropdown -->
    <Transition
      enter-active-class="transition duration-100 ease-out"
      enter-from-class="scale-95 opacity-0"
      enter-to-class="scale-100 opacity-100"
      leave-active-class="transition duration-75 ease-in"
      leave-from-class="scale-100 opacity-100"
      leave-to-class="scale-95 opacity-0"
    >
      <div
        v-if="showSelector && !isConnected"
        class="absolute right-0 top-full z-50 mt-2 w-72 rounded-xl border border-surface-700 bg-surface-900 p-3 shadow-xl"
      >
        <WalletSelector
          :wallets="detectedWallets"
          :is-connecting="isConnecting"
          @select="handleSelect"
          @close="showSelector = false"
        />
        <p v-if="error" class="mt-2 text-xs text-red-400">{{ error }}</p>
      </div>
    </Transition>

    <!-- Connected dropdown -->
    <Transition
      enter-active-class="transition duration-100 ease-out"
      enter-from-class="scale-95 opacity-0"
      enter-to-class="scale-100 opacity-100"
      leave-active-class="transition duration-75 ease-in"
      leave-from-class="scale-100 opacity-100"
      leave-to-class="scale-95 opacity-0"
    >
      <div
        v-if="showDropdown && isConnected"
        class="absolute right-0 top-full z-50 mt-2 w-56 rounded-xl border border-surface-700 bg-surface-900 p-2 shadow-xl"
      >
        <button
          class="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-surface-300 hover:bg-surface-800 hover:text-white"
          @click="handleDisconnect"
        >
          <svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clip-rule="evenodd" />
          </svg>
          Disconnect
        </button>
      </div>
    </Transition>
  </div>
</template>
