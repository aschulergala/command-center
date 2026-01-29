<script setup lang="ts">
import type { TokenBalance } from '@/stores/tokens';
import { computed } from 'vue';

const props = defineProps<{
  token: TokenBalance;
}>();

const emit = defineEmits<{
  transfer: [token: TokenBalance];
  burn: [token: TokenBalance];
  lock: [token: TokenBalance];
  unlock: [token: TokenBalance];
}>();

const hasLockedBalance = computed(() => Number(props.token.lockedQuantity) > 0);
</script>

<template>
  <div class="card flex flex-col gap-4">
    <!-- Token Name -->
    <div class="flex items-center justify-between">
      <h3 class="text-base font-semibold text-white">{{ token.displayName }}</h3>
      <span class="rounded-md bg-surface-800 px-2 py-0.5 text-xs text-surface-400">
        {{ token.collection }}
      </span>
    </div>

    <!-- Balance Details -->
    <div class="grid grid-cols-3 gap-3">
      <div>
        <p class="text-xs text-surface-500">Total</p>
        <p class="mt-0.5 font-mono text-sm font-medium text-white">
          {{ token.quantity }}
        </p>
      </div>
      <div>
        <p class="text-xs text-surface-500">Available</p>
        <p class="mt-0.5 font-mono text-sm font-medium text-green-400">
          {{ token.availableQuantity }}
        </p>
      </div>
      <div>
        <p class="text-xs text-surface-500">Locked</p>
        <p
          class="mt-0.5 font-mono text-sm font-medium"
          :class="hasLockedBalance ? 'text-amber-400' : 'text-surface-600'"
        >
          {{ token.lockedQuantity }}
        </p>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="flex flex-wrap gap-2 border-t border-surface-800 pt-3">
      <button
        class="btn-secondary text-xs"
        @click="emit('transfer', token)"
      >
        Transfer
      </button>
      <button
        class="btn-secondary text-xs"
        @click="emit('burn', token)"
      >
        Burn
      </button>
      <button
        class="btn-secondary text-xs"
        @click="emit('lock', token)"
      >
        Lock
      </button>
      <button
        v-if="hasLockedBalance"
        class="btn-secondary text-xs"
        @click="emit('unlock', token)"
      >
        Unlock
      </button>
    </div>
  </div>
</template>
