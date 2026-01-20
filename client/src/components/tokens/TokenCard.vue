<script setup lang="ts">
import { computed } from 'vue'
import type { FungibleTokenDisplay } from '@shared/types/display'

interface Props {
  token: FungibleTokenDisplay
}

const props = defineProps<Props>()

const emit = defineEmits<{
  transfer: [token: FungibleTokenDisplay]
  mint: [token: FungibleTokenDisplay]
  burn: [token: FungibleTokenDisplay]
}>()

// Check if there are locked tokens (non-zero locked balance)
const hasLockedBalance = computed(() => {
  return props.token.lockedBalanceRaw !== '0' && props.token.lockedBalanceRaw !== ''
})

// Check if spendable differs from total (meaning some is locked/in-use)
const hasBalanceDifference = computed(() => {
  return props.token.spendableBalanceRaw !== props.token.balanceRaw
})
</script>

<template>
  <div class="card hover:shadow-md transition-shadow">
    <!-- Token Header -->
    <div class="flex items-start justify-between mb-4">
      <div class="flex items-center gap-3">
        <!-- Token Icon/Image -->
        <div
          class="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
          :class="token.image ? 'bg-transparent' : 'bg-gradient-to-br from-gala-primary to-gala-secondary'"
        >
          <img
            v-if="token.image"
            :src="token.image"
            :alt="token.name"
            class="w-10 h-10 rounded-full object-cover"
          />
          <span v-else>{{ token.symbol.slice(0, 2).toUpperCase() }}</span>
        </div>

        <!-- Token Name & Symbol -->
        <div>
          <h3 class="font-semibold text-gray-900 dark:text-white">
            {{ token.name }}
          </h3>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            {{ token.symbol }}
          </p>
        </div>
      </div>

      <!-- Authority Badges -->
      <div class="flex gap-1">
        <span
          v-if="token.canMint"
          class="px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
          title="You can mint this token"
        >
          Mint
        </span>
        <span
          v-if="token.canBurn"
          class="px-2 py-0.5 text-xs font-medium rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
          title="You can burn this token"
        >
          Burn
        </span>
      </div>
    </div>

    <!-- Balance Section -->
    <div class="mb-4">
      <div class="flex items-baseline justify-between">
        <span class="text-2xl font-bold text-gray-900 dark:text-white">
          {{ token.balanceFormatted }}
        </span>
        <span class="text-sm text-gray-500 dark:text-gray-400">
          {{ token.symbol }}
        </span>
      </div>

      <!-- Balance Details -->
      <div
        v-if="hasLockedBalance || hasBalanceDifference"
        class="mt-2 pt-2 border-t border-gray-100 dark:border-gray-700"
      >
        <div class="flex justify-between text-sm">
          <span class="text-gray-500 dark:text-gray-400">Spendable:</span>
          <span class="text-gray-700 dark:text-gray-300">
            {{ token.spendableBalanceFormatted }}
          </span>
        </div>
        <div
          v-if="hasLockedBalance"
          class="flex justify-between text-sm"
        >
          <span class="text-gray-500 dark:text-gray-400">Locked:</span>
          <span class="text-yellow-600 dark:text-yellow-400">
            {{ token.lockedBalanceFormatted }}
          </span>
        </div>
      </div>
    </div>

    <!-- Mint Allowance Info -->
    <div
      v-if="token.canMint && token.mintAllowanceFormatted"
      class="mb-4 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg text-sm"
    >
      <div class="flex justify-between">
        <span class="text-green-700 dark:text-green-400">Mint Allowance:</span>
        <span class="font-medium text-green-800 dark:text-green-300">
          {{ token.mintAllowanceFormatted }}
        </span>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="flex gap-2">
      <button
        class="btn-primary flex-1 text-sm py-2"
        @click="emit('transfer', token)"
      >
        Transfer
      </button>

      <button
        v-if="token.canMint"
        class="btn-secondary flex-1 text-sm py-2"
        @click="emit('mint', token)"
      >
        Mint
      </button>

      <button
        v-if="token.canBurn"
        class="flex-1 text-sm py-2 px-4 rounded-lg border border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors"
        @click="emit('burn', token)"
      >
        Burn
      </button>
    </div>
  </div>
</template>
