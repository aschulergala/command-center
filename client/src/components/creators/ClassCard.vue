<script setup lang="ts">
/**
 * ClassCard.vue
 * Displays a single token class within a collection with its properties
 */
import type { CreatorClassDisplay } from '@/stores/creatorCollections'

defineProps<{
  classItem: CreatorClassDisplay
}>()

const emit = defineEmits<{
  (e: 'mint', classItem: CreatorClassDisplay): void
}>()

/**
 * Format the supply display
 */
function formatSupply(minted: string, max: string): string {
  const maxFormatted = max === '0' || !max ? '∞' : parseInt(max, 10).toLocaleString()
  const mintedFormatted = parseInt(minted, 10).toLocaleString()
  return `${mintedFormatted} / ${maxFormatted}`
}

/**
 * Calculate minted percentage for progress bar
 */
function getMintedPercentage(minted: string, max: string): number {
  if (max === '0' || !max) return 0 // Unlimited
  const mintedNum = parseInt(minted, 10) || 0
  const maxNum = parseInt(max, 10) || 1
  return Math.min(100, (mintedNum / maxNum) * 100)
}

/**
 * Get initials for class placeholder
 */
function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map(word => word[0])
    .join('')
    .toUpperCase() || '??'
}
</script>

<template>
  <div class="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
    <div class="flex items-center gap-3">
      <!-- Class Icon/Initials -->
      <div class="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
        <span class="text-white text-xs font-bold">{{ getInitials(classItem.name) }}</span>
      </div>

      <!-- Class Info -->
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2">
          <span class="font-medium text-gray-900 truncate">{{ classItem.name }}</span>
          <span
            v-if="classItem.additionalKey"
            class="text-xs text-gray-400 truncate"
            :title="classItem.additionalKey"
          >
            ({{ classItem.additionalKey.length > 10 ? classItem.additionalKey.slice(0, 10) + '...' : classItem.additionalKey }})
          </span>
        </div>

        <!-- Supply Progress -->
        <div class="mt-1 flex items-center gap-2">
          <div class="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              class="h-full bg-purple-500 rounded-full transition-all"
              :style="{ width: getMintedPercentage(classItem.mintedCount, classItem.maxSupply) + '%' }"
            ></div>
          </div>
          <span class="text-xs text-gray-500 whitespace-nowrap">
            {{ formatSupply(classItem.mintedCount, classItem.maxSupply) }}
          </span>
        </div>
      </div>

      <!-- Mint Button -->
      <button
        v-if="classItem.canMintMore"
        class="flex-shrink-0 px-3 py-1.5 text-xs font-medium text-green-700 bg-green-100 hover:bg-green-200 rounded-lg transition-colors"
        @click="emit('mint', classItem)"
      >
        Mint
      </button>
      <span
        v-else
        class="flex-shrink-0 px-2 py-1 text-xs text-gray-400 bg-gray-100 rounded"
      >
        Max Reached
      </span>
    </div>
  </div>
</template>
