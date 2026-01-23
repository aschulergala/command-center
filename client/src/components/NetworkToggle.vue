<script setup lang="ts">
import { useNetworkStore } from '@/stores/network'

const networkStore = useNetworkStore()

function handleToggle() {
  networkStore.toggleNetwork()
  window.location.reload()
}
</script>

<template>
  <button
    type="button"
    class="flex items-center gap-1.5 px-2 py-1 text-xs font-medium rounded-md transition-colors"
    :class="networkStore.isMainnet
      ? 'bg-green-100 text-green-700 hover:bg-green-200'
      : 'bg-amber-100 text-amber-700 hover:bg-amber-200'"
    @click="handleToggle"
    :title="`Switch to ${networkStore.isMainnet ? 'Testnet' : 'Mainnet'}`"
  >
    <span
      class="w-2 h-2 rounded-full"
      :class="networkStore.isMainnet ? 'bg-green-500' : 'bg-amber-500'"
    />
    <span>{{ networkStore.networkLabel }}</span>
  </button>
</template>
