<script setup lang="ts">
/**
 * ClassList.vue
 * Displays a list of token classes within a collection
 */
import type { CreatorClassDisplay } from '@/stores/creatorCollections'
import ClassCard from './ClassCard.vue'

defineProps<{
  classes: CreatorClassDisplay[]
  isLoading?: boolean
}>()

const emit = defineEmits<{
  (e: 'mint', classItem: CreatorClassDisplay): void
  (e: 'createClass'): void
}>()
</script>

<template>
  <div>
    <!-- Loading State -->
    <div v-if="isLoading" class="space-y-2">
      <div v-for="i in 2" :key="i" class="p-3 bg-gray-50 rounded-lg animate-pulse">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-gray-200 rounded-lg"></div>
          <div class="flex-1">
            <div class="h-4 bg-gray-200 rounded w-24 mb-2"></div>
            <div class="h-1.5 bg-gray-200 rounded-full w-full"></div>
          </div>
          <div class="w-12 h-6 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="classes.length === 0" class="text-center py-6">
      <div class="w-12 h-12 mx-auto mb-3 rounded-full bg-purple-100 flex items-center justify-center">
        <svg class="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      </div>
      <p class="text-sm text-gray-500 mb-3">No classes defined yet.</p>
      <button
        class="text-sm text-purple-600 hover:text-purple-700 font-medium"
        @click="emit('createClass')"
      >
        Create your first class →
      </button>
    </div>

    <!-- Classes List -->
    <div v-else class="space-y-2">
      <ClassCard
        v-for="classItem in classes"
        :key="classItem.classKey"
        :class-item="classItem"
        @mint="emit('mint', classItem)"
      />
    </div>
  </div>
</template>
