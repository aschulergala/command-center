<script setup lang="ts">
defineProps<{
  title: string
  description?: string
}>()
</script>

<template>
  <div class="mb-6">
    <h1 class="text-2xl font-bold text-gray-900">{{ title }}</h1>
    <p v-if="description" class="mt-1 text-sm text-gray-600">{{ description }}</p>
    <slot name="actions" />
  </div>
</template>
