<script setup lang="ts">
defineProps<{
  lines?: number;
}>();
</script>

<template>
  <div class="card animate-pulse">
    <div class="mb-3 h-4 w-1/3 rounded bg-surface-800" />
    <div
      v-for="i in (lines ?? 3)"
      :key="i"
      class="mb-2 h-3 rounded bg-surface-800"
      :class="i === (lines ?? 3) ? 'w-2/3' : 'w-full'"
    />
  </div>
</template>
