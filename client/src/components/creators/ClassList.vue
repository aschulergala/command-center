<script setup lang="ts">
import type { NftTokenClassWithSupply } from '@/stores/creators';
import ClassCard from '@/components/creators/ClassCard.vue';
import SkeletonCard from '@/components/ui/SkeletonCard.vue';
import EmptyState from '@/components/ui/EmptyState.vue';

defineProps<{
  classes: NftTokenClassWithSupply[];
  isLoading: boolean;
}>();

const emit = defineEmits<{
  mint: [tokenClass: NftTokenClassWithSupply];
  create: [];
}>();
</script>

<template>
  <!-- Loading State -->
  <div v-if="isLoading" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
    <SkeletonCard v-for="i in 6" :key="i" :lines="4" />
  </div>

  <!-- Empty State -->
  <EmptyState
    v-else-if="classes.length === 0"
    title="No token classes found"
    description="Create a token class to define your NFT types within this collection."
  >
    <template #action>
      <button class="btn-primary" @click="emit('create')">
        Create Token Class
      </button>
    </template>
  </EmptyState>

  <!-- Class Cards -->
  <div v-else class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
    <ClassCard
      v-for="tc in classes"
      :key="`${tc.collection}|${tc.type}|${tc.category}|${tc.additionalKey}`"
      :token-class="tc"
      @mint="emit('mint', $event)"
    />
  </div>
</template>
