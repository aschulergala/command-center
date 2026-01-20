<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import type { CollectionDisplay } from '@shared/types/display'

interface Props {
  collections: CollectionDisplay[]
  modelValue: string | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: string | null]
}>()

const isOpen = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)

// Find the selected collection for display
const selectedCollectionName = computed(() => {
  if (!props.modelValue) return 'All Collections'
  const collection = props.collections.find(c => c.collectionKey === props.modelValue)
  return collection?.name || 'All Collections'
})

function selectCollection(collectionKey: string | null): void {
  emit('update:modelValue', collectionKey)
  isOpen.value = false
}

// Close dropdown when clicking outside
function handleClickOutside(event: MouseEvent): void {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div
    ref="dropdownRef"
    class="relative"
  >
    <!-- Dropdown Button -->
    <button
      class="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
      @click="isOpen = !isOpen"
    >
      <svg
        class="w-4 h-4 text-gray-500"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
        />
      </svg>
      <span class="max-w-32 truncate">{{ selectedCollectionName }}</span>
      <svg
        class="w-4 h-4 transition-transform"
        :class="{ 'rotate-180': isOpen }"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M19 9l-7 7-7-7"
        />
      </svg>
    </button>

    <!-- Dropdown Menu -->
    <Transition
      enter-active-class="transition ease-out duration-100"
      enter-from-class="transform opacity-0 scale-95"
      enter-to-class="transform opacity-100 scale-100"
      leave-active-class="transition ease-in duration-75"
      leave-from-class="transform opacity-100 scale-100"
      leave-to-class="transform opacity-0 scale-95"
    >
      <div
        v-if="isOpen"
        class="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10 max-h-80 overflow-auto"
      >
        <div class="py-1">
          <!-- All Collections Option -->
          <button
            class="w-full flex items-center justify-between px-4 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            :class="{
              'text-gala-primary font-medium': !modelValue,
              'text-gray-700 dark:text-gray-300': modelValue
            }"
            @click="selectCollection(null)"
          >
            <span>All Collections</span>
            <svg
              v-if="!modelValue"
              class="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </button>

          <hr class="my-1 border-gray-200 dark:border-gray-700" />

          <!-- Collection Options -->
          <button
            v-for="collection in collections"
            :key="collection.collectionKey"
            class="w-full flex items-center justify-between px-4 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            :class="{
              'text-gala-primary font-medium': modelValue === collection.collectionKey,
              'text-gray-700 dark:text-gray-300': modelValue !== collection.collectionKey
            }"
            @click="selectCollection(collection.collectionKey)"
          >
            <div class="flex-1 min-w-0">
              <div class="truncate" :title="collection.name">
                {{ collection.name }}
              </div>
              <div class="text-xs text-gray-500 dark:text-gray-400">
                {{ collection.ownedCount }} owned
              </div>
            </div>
            <svg
              v-if="modelValue === collection.collectionKey"
              class="w-4 h-4 flex-shrink-0 ml-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </button>

          <!-- Empty State -->
          <div
            v-if="collections.length === 0"
            class="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 text-center"
          >
            No collections found
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>
