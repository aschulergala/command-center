<script setup lang="ts">
import type { NFTDisplay } from '@shared/types/display'
import NFTCard from './NFTCard.vue'
import NFTCardSkeleton from './NFTCardSkeleton.vue'

interface Props {
  nfts: NFTDisplay[]
  isLoading?: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  transfer: [nft: NFTDisplay]
  burn: [nft: NFTDisplay]
}>()
</script>

<template>
  <div>
    <!-- Loading State -->
    <div
      v-if="isLoading && nfts.length === 0"
      class="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
    >
      <NFTCardSkeleton v-for="i in 8" :key="i" />
    </div>

    <!-- NFT Grid -->
    <div
      v-else-if="nfts.length > 0"
      class="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
    >
      <NFTCard
        v-for="nft in nfts"
        :key="nft.instanceKey"
        :nft="nft"
        @transfer="emit('transfer', $event)"
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
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </div>
      <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-1">
        No NFTs found
      </h3>
      <p class="text-gray-500 dark:text-gray-400">
        You don't have any NFTs yet, or none match the current filter.
      </p>
    </div>
  </div>
</template>
