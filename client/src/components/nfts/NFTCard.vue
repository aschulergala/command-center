<script setup lang="ts">
import type { NftBalance } from '@/stores/nfts';

defineProps<{
  nft: NftBalance;
}>();

const emit = defineEmits<{
  transfer: [nft: NftBalance];
  burn: [nft: NftBalance];
}>();
</script>

<template>
  <div class="card flex flex-col gap-4">
    <!-- Collection Name & Type Badge -->
    <div class="flex items-center justify-between">
      <h3 class="truncate text-base font-semibold text-white">{{ nft.collection }}</h3>
      <span class="ml-2 flex-shrink-0 rounded-md bg-surface-800 px-2 py-0.5 text-xs text-surface-400">
        {{ nft.category }}
      </span>
    </div>

    <!-- Type & Additional Key -->
    <div class="flex flex-col gap-2">
      <div>
        <p class="text-xs text-surface-500">Type</p>
        <p class="mt-0.5 text-sm font-medium text-white">{{ nft.type }}</p>
      </div>
      <div v-if="nft.additionalKey" class="min-w-0">
        <p class="text-xs text-surface-500">Additional Key</p>
        <p class="mt-0.5 truncate text-sm font-medium text-surface-300">{{ nft.additionalKey }}</p>
      </div>
    </div>

    <!-- Instance Count -->
    <div class="rounded-lg bg-surface-800 px-3 py-2">
      <div class="flex items-center justify-between">
        <p class="text-xs text-surface-500">Instances Owned</p>
        <p class="font-mono text-sm font-semibold text-gala-400">{{ nft.totalOwned }}</p>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="flex flex-wrap gap-2 border-t border-surface-800 pt-3">
      <button
        class="btn-secondary min-h-[44px] text-xs sm:min-h-0"
        @click="emit('transfer', nft)"
      >
        Transfer
      </button>
      <button
        class="btn-danger min-h-[44px] text-xs sm:min-h-0"
        @click="emit('burn', nft)"
      >
        Burn
      </button>
    </div>
  </div>
</template>
