<script setup lang="ts">
/**
 * CollectionList.vue
 * Displays a list of creator collections with loading and empty states.
 * Also shows pending (claimed but not created) collections.
 */
import CollectionCard from './CollectionCard.vue'
import CollectionCardSkeleton from './CollectionCardSkeleton.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import type { CreatorCollectionDisplay } from '@/stores/creatorCollections'
import type { ClaimedCollection } from '@/composables/useNftCollectionAuth'

defineProps<{
  collections: CreatorCollectionDisplay[]
  pendingCollections?: ClaimedCollection[]
  isLoading: boolean
}>()

const emit = defineEmits<{
  (e: 'mint', collection: CreatorCollectionDisplay): void
  (e: 'manageClasses', collection: CreatorCollectionDisplay): void
  (e: 'toggleExpand', collectionKey: string): void
  (e: 'completePending', collectionName: string): void
}>()
</script>

<template>
  <div class="collection-list">
    <!-- Loading State -->
    <div v-if="isLoading && collections.length === 0 && (!pendingCollections || pendingCollections.length === 0)" class="space-y-4">
      <CollectionCardSkeleton v-for="i in 3" :key="i" />
    </div>

    <!-- Empty State (only if no collections AND no pending collections) -->
    <EmptyState
      v-else-if="!isLoading && collections.length === 0 && (!pendingCollections || pendingCollections.length === 0)"
      title="No Collections Found"
      description="You don't have authority over any collections yet. Create a new collection to get started."
      icon="collections"
    />

    <!-- Content (collections and/or pending collections exist) -->
    <div v-else class="space-y-6">
      <!-- Existing Collection Cards -->
      <div v-if="collections.length > 0" class="space-y-4">
        <CollectionCard
          v-for="collection in collections"
          :key="collection.collectionKey"
          :collection="collection"
          @mint="emit('mint', $event)"
          @manage-classes="emit('manageClasses', $event)"
          @toggle-expand="emit('toggleExpand', $event)"
        />
      </div>

      <!-- Pending Collections (claimed but not created) -->
      <div v-if="pendingCollections && pendingCollections.length > 0">
        <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <button
            v-for="pending in pendingCollections"
            :key="pending.collection"
            class="p-4 text-left border border-amber-200 bg-amber-50 rounded-lg hover:bg-amber-100 hover:border-amber-300 transition-colors group"
            @click="emit('completePending', pending.collection)"
          >
            <div class="flex items-center justify-between">
              <span class="font-medium text-gray-900">{{ pending.collection }}</span>
              <span class="text-xs px-2 py-0.5 rounded-full bg-amber-200 text-amber-800">Claimed</span>
            </div>
            <p class="text-sm text-gray-500 mt-1 group-hover:text-gray-700">
              Click to complete creation
            </p>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
