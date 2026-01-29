<script setup lang="ts">
import type { NftCollectionAuthorization } from '@/stores/creators';
import CollectionCard from '@/components/creators/CollectionCard.vue';
import CollectionCardSkeleton from '@/components/creators/CollectionCardSkeleton.vue';
import EmptyState from '@/components/ui/EmptyState.vue';

defineProps<{
  collections: NftCollectionAuthorization[];
  isLoading: boolean;
  selectedCollection: NftCollectionAuthorization | null;
}>();

const emit = defineEmits<{
  select: [collection: NftCollectionAuthorization];
  create: [];
}>();
</script>

<template>
  <!-- Loading State -->
  <div v-if="isLoading" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
    <CollectionCardSkeleton v-for="i in 6" :key="i" />
  </div>

  <!-- Empty State -->
  <EmptyState
    v-else-if="collections.length === 0"
    title="No collections found"
    description="Claim a collection to start creating NFT token classes."
  >
    <template #action>
      <button class="btn-primary" @click="emit('create')">
        Claim Collection
      </button>
    </template>
  </EmptyState>

  <!-- Collection Cards -->
  <div v-else class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
    <CollectionCard
      v-for="col in collections"
      :key="col.collection"
      :collection="col"
      :is-selected="selectedCollection?.collection === col.collection"
      @select="emit('select', $event)"
    />
  </div>
</template>
