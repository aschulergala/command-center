<script setup lang="ts">
import type { NftTokenClassWithSupply } from '@/stores/creators';
import { computed } from 'vue';

const props = defineProps<{
  tokenClass: NftTokenClassWithSupply;
}>();

const emit = defineEmits<{
  mint: [tokenClass: NftTokenClassWithSupply];
}>();

const displayName = computed(() => props.tokenClass.name || props.tokenClass.type);

const supplyDisplay = computed(() => {
  const current = props.tokenClass.totalSupply || '0';
  const max = props.tokenClass.maxSupply;
  return max ? `${current} / ${max}` : current;
});

const supplyPercentage = computed(() => {
  if (!props.tokenClass.maxSupply) return null;
  const current = Number(props.tokenClass.totalSupply || '0');
  const max = Number(props.tokenClass.maxSupply);
  if (max === 0) return 0;
  return Math.min(100, Math.round((current / max) * 100));
});
</script>

<template>
  <div class="card flex flex-col gap-3">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <h3 class="text-base font-semibold text-white">{{ displayName }}</h3>
      <span
        v-if="tokenClass.rarity"
        class="rounded-full bg-purple-500/20 px-2 py-0.5 text-xs font-medium text-purple-400"
      >
        {{ tokenClass.rarity }}
      </span>
    </div>

    <!-- Details -->
    <div class="grid grid-cols-2 gap-3">
      <div>
        <p class="text-xs text-surface-500">Type</p>
        <p class="mt-0.5 text-sm text-surface-300">{{ tokenClass.type }}</p>
      </div>
      <div>
        <p class="text-xs text-surface-500">Category</p>
        <p class="mt-0.5 text-sm text-surface-300">{{ tokenClass.category }}</p>
      </div>
    </div>

    <!-- Supply -->
    <div>
      <div class="flex items-center justify-between">
        <p class="text-xs text-surface-500">Supply</p>
        <p class="font-mono text-sm font-medium text-white">{{ supplyDisplay }}</p>
      </div>
      <div
        v-if="supplyPercentage !== null"
        class="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-surface-800"
      >
        <div
          class="h-full rounded-full bg-gala-500 transition-all duration-300"
          :style="{ width: `${supplyPercentage}%` }"
        />
      </div>
    </div>

    <!-- Mint Button -->
    <div class="border-t border-surface-800 pt-3">
      <button
        class="btn-primary w-full text-xs"
        @click="emit('mint', tokenClass)"
      >
        Mint
      </button>
    </div>
  </div>
</template>
