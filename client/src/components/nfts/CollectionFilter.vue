<script setup lang="ts">
defineProps<{
  collections: string[];
  modelValue: string;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: string];
}>();
</script>

<template>
  <div
    v-if="collections.length > 0"
    class="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 scrollbar-thin scrollbar-thumb-surface-700 scrollbar-track-transparent sm:mx-0 sm:flex-wrap sm:px-0"
  >
    <!-- All collections button -->
    <button
      class="flex-shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors min-h-[44px] sm:min-h-0"
      :class="
        modelValue === ''
          ? 'bg-gala-500 text-white'
          : 'bg-surface-800 text-surface-400 hover:bg-surface-700 hover:text-white'
      "
      @click="emit('update:modelValue', '')"
    >
      All
    </button>

    <!-- Individual collection buttons -->
    <button
      v-for="collection in collections"
      :key="collection"
      class="flex-shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors min-h-[44px] sm:min-h-0"
      :class="
        modelValue === collection
          ? 'bg-gala-500 text-white'
          : 'bg-surface-800 text-surface-400 hover:bg-surface-700 hover:text-white'
      "
      @click="emit('update:modelValue', collection)"
    >
      {{ collection }}
    </button>
  </div>
</template>
