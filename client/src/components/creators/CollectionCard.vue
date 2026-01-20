<script setup lang="ts">
/**
 * CollectionCard.vue
 * Displays a single creator collection with its details and action buttons.
 * Shows collection name, symbol, mint allowance, owned count, and expandable class list.
 */
import type { CreatorCollectionDisplay } from '@/stores/creatorCollections'

defineProps<{
  collection: CreatorCollectionDisplay
}>()

const emit = defineEmits<{
  (e: 'mint', collection: CreatorCollectionDisplay): void
  (e: 'manageClasses', collection: CreatorCollectionDisplay): void
  (e: 'toggleExpand', collectionKey: string): void
}>()

/**
 * Get initials for collection placeholder
 */
function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map(word => word[0])
    .join('')
    .toUpperCase() || '??'
}

/**
 * Format collection key for display (truncate if long)
 */
function formatCollectionKey(key: string): string {
  if (key.length <= 30) return key
  return key.slice(0, 15) + '...' + key.slice(-12)
}
</script>

<template>
  <div class="card hover:shadow-md transition-shadow">
    <div class="flex items-start gap-4">
      <!-- Collection Image/Placeholder -->
      <div class="flex-shrink-0">
        <div
          v-if="collection.image"
          class="w-16 h-16 rounded-xl overflow-hidden bg-gray-100"
        >
          <img
            :src="collection.image"
            :alt="collection.name"
            class="w-full h-full object-cover"
          />
        </div>
        <div
          v-else
          class="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center"
        >
          <span class="text-white text-lg font-bold">{{ getInitials(collection.name) }}</span>
        </div>
      </div>

      <!-- Collection Info -->
      <div class="flex-1 min-w-0">
        <div class="flex items-start justify-between gap-2">
          <div class="min-w-0">
            <h3 class="text-lg font-semibold text-gray-900 truncate">{{ collection.name }}</h3>
            <p class="text-sm text-gray-500 truncate" :title="collection.collectionKey">
              {{ formatCollectionKey(collection.collectionKey) }}
            </p>
          </div>

          <!-- Authority Badge -->
          <span class="flex-shrink-0 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
            Authority
          </span>
        </div>

        <!-- Stats Row -->
        <div class="mt-3 flex items-center gap-4 text-sm">
          <!-- Owned Count -->
          <div class="flex items-center gap-1.5">
            <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <span class="text-gray-600">
              <span class="font-medium">{{ collection.ownedCount }}</span> owned
            </span>
          </div>

          <!-- Mint Allowance -->
          <div class="flex items-center gap-1.5">
            <svg class="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            <span class="text-gray-600">
              <span class="font-medium text-green-600">{{ collection.mintAllowanceFormatted }}</span>
              <span v-if="!collection.hasUnlimitedMint"> mint remaining</span>
            </span>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="mt-4 flex items-center gap-2">
          <button
            class="btn-primary text-sm"
            @click="emit('mint', collection)"
          >
            <span class="flex items-center gap-1.5">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              Mint
            </span>
          </button>

          <button
            class="btn-secondary text-sm"
            disabled
            title="Coming in creators-manage-classes task"
            @click="emit('manageClasses', collection)"
          >
            <span class="flex items-center gap-1.5">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              Manage Classes
            </span>
          </button>

          <!-- Expand/Collapse Button -->
          <button
            class="ml-auto p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            :title="collection.isExpanded ? 'Collapse' : 'Expand'"
            disabled
            @click="emit('toggleExpand', collection.collectionKey)"
          >
            <svg
              class="w-5 h-5 transition-transform"
              :class="{ 'rotate-180': collection.isExpanded }"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        <!-- Expandable Classes Section (placeholder for future) -->
        <div
          v-if="collection.isExpanded && collection.classes.length > 0"
          class="mt-4 pt-4 border-t border-gray-100"
        >
          <h4 class="text-sm font-medium text-gray-700 mb-2">Classes</h4>
          <div class="space-y-2">
            <div
              v-for="classItem in collection.classes"
              :key="classItem.classKey"
              class="p-2 bg-gray-50 rounded-lg text-sm"
            >
              <span class="font-medium">{{ classItem.name }}</span>
              <span class="text-gray-500 ml-2">
                {{ classItem.mintedCountFormatted }} / {{ classItem.maxSupplyFormatted === '0' ? '∞' : classItem.maxSupplyFormatted }}
              </span>
            </div>
          </div>
        </div>

        <!-- Empty Classes State -->
        <div
          v-else-if="collection.isExpanded && collection.classes.length === 0"
          class="mt-4 pt-4 border-t border-gray-100 text-center text-sm text-gray-500"
        >
          <p>No classes defined yet.</p>
          <p class="text-xs mt-1">Use "Manage Classes" to create token classes.</p>
        </div>
      </div>
    </div>
  </div>
</template>
