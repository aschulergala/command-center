<script setup lang="ts">
defineProps<{
  title: string;
  description?: string;
}>();
</script>

<template>
  <div class="flex items-start justify-between">
    <div>
      <h2 class="text-2xl font-bold text-white">{{ title }}</h2>
      <p v-if="description" class="mt-1 text-sm text-surface-400">{{ description }}</p>
    </div>
    <div v-if="$slots.actions" class="flex items-center gap-2">
      <slot name="actions" />
    </div>
  </div>
</template>
