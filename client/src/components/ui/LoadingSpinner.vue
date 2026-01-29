<script setup lang="ts">
defineProps<{
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}>();

const sizeClasses = {
  sm: 'h-4 w-4 border-2',
  md: 'h-6 w-6 border-2',
  lg: 'h-8 w-8 border-[3px]',
};
</script>

<template>
  <div role="status" aria-label="Loading" class="flex items-center justify-center gap-2">
    <div
      class="animate-spin rounded-full border-surface-600 border-t-gala-500"
      :class="sizeClasses[size ?? 'md']"
    />
    <span v-if="label" class="text-sm text-surface-400">{{ label }}</span>
  </div>
</template>
