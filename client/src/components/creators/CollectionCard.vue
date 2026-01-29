<script setup lang="ts">
import type { NftCollectionAuthorization } from '@/stores/creators';
import { computed } from 'vue';

const props = defineProps<{
  collection: NftCollectionAuthorization;
  isSelected: boolean;
}>();

const emit = defineEmits<{
  select: [collection: NftCollectionAuthorization];
}>();

const truncatedUser = computed(() => {
  const user = props.collection.authorizedUser;
  if (user.length <= 16) return user;
  return `${user.slice(0, 8)}...${user.slice(-6)}`;
});

const formattedDate = computed(() => {
  if (!props.collection.created) return null;
  return new Date(props.collection.created).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
});
</script>

<template>
  <button
    type="button"
    class="card flex w-full flex-col gap-3 text-left transition-all duration-150"
    :class="[
      isSelected
        ? 'border-gala-500 bg-gala-500/20'
        : 'hover:border-surface-700 hover:bg-surface-800/50',
    ]"
    @click="emit('select', collection)"
  >
    <!-- Collection Name -->
    <div class="flex items-center justify-between">
      <h3 class="text-base font-semibold text-white">{{ collection.collection }}</h3>
      <span
        v-if="isSelected"
        class="rounded-full bg-gala-500/30 px-2 py-0.5 text-xs font-medium text-gala-400"
      >
        Selected
      </span>
    </div>

    <!-- Details -->
    <div class="flex flex-col gap-1.5">
      <div>
        <p class="text-xs text-surface-500">Authorized User</p>
        <p class="mt-0.5 font-mono text-sm text-surface-300" :title="collection.authorizedUser">
          {{ truncatedUser }}
        </p>
      </div>
      <div v-if="formattedDate">
        <p class="text-xs text-surface-500">Created</p>
        <p class="mt-0.5 text-sm text-surface-300">{{ formattedDate }}</p>
      </div>
    </div>
  </button>
</template>
