<script setup lang="ts">
import type { FungibleTokenDisplay } from '@shared/types/display'
import TokenCard from './TokenCard.vue'
import TokenCardSkeleton from './TokenCardSkeleton.vue'

interface Props {
  tokens: FungibleTokenDisplay[]
  isLoading?: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  transfer: [token: FungibleTokenDisplay]
  mint: [token: FungibleTokenDisplay]
  burn: [token: FungibleTokenDisplay]
}>()
</script>

<template>
  <div>
    <!-- Loading State -->
    <div
      v-if="isLoading && tokens.length === 0"
      class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
    >
      <TokenCardSkeleton v-for="i in 6" :key="i" />
    </div>

    <!-- Token Grid -->
    <div
      v-else-if="tokens.length > 0"
      class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
    >
      <TokenCard
        v-for="token in tokens"
        :key="token.tokenKey"
        :token="token"
        @transfer="emit('transfer', $event)"
        @mint="emit('mint', $event)"
        @burn="emit('burn', $event)"
      />
    </div>

    <!-- Empty State -->
    <div
      v-else
      class="text-center py-12"
    >
      <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
        <svg
          class="w-8 h-8 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-1">
        No tokens found
      </h3>
      <p class="text-gray-500 dark:text-gray-400">
        You don't have any fungible tokens yet.
      </p>
    </div>
  </div>
</template>
