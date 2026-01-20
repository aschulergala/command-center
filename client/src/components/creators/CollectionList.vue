<script setup lang="ts">
/**
 * CollectionList.vue
 * Displays a list of creator collections with loading and empty states.
 */
import CollectionCard from './CollectionCard.vue'
import CollectionCardSkeleton from './CollectionCardSkeleton.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import type { CreatorCollectionDisplay } from '@/stores/creatorCollections'

defineProps<{
  collections: CreatorCollectionDisplay[]
  isLoading: boolean
}>()

const emit = defineEmits<{
  (e: 'mint', collection: CreatorCollectionDisplay): void
  (e: 'manageClasses', collection: CreatorCollectionDisplay): void
  (e: 'toggleExpand', collectionKey: string): void
}>()
</script>

<template>
  <div class="collection-list">
    <!-- Loading State -->
    <div v-if="isLoading && collections.length === 0" class="space-y-4">
      <CollectionCardSkeleton v-for="i in 3" :key="i" />
    </div>

    <!-- Empty State -->
    <EmptyState
      v-else-if="!isLoading && collections.length === 0"
      title="No Collections Found"
      description="You don't have authority over any collections yet. Create a new collection to get started."
      icon="collections"
    />

    <!-- Collection Cards -->
    <div v-else class="space-y-4">
      <CollectionCard
        v-for="collection in collections"
        :key="collection.collectionKey"
        :collection="collection"
        @mint="emit('mint', $event)"
        @manage-classes="emit('manageClasses', $event)"
        @toggle-expand="emit('toggleExpand', $event)"
      />
    </div>
  </div>
</template>
