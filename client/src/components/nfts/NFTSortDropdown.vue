<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import type { NFTSortOption } from '@/stores/nfts'

interface Props {
  modelValue: NFTSortOption
}

defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: NFTSortOption]
}>()

const isOpen = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)

interface SortOptionConfig {
  value: NFTSortOption
  label: string
}

const sortOptions: SortOptionConfig[] = [
  { value: 'collection-asc', label: 'Collection A-Z' },
  { value: 'collection-desc', label: 'Collection Z-A' },
  { value: 'instance-asc', label: 'ID (Low to High)' },
  { value: 'instance-desc', label: 'ID (High to Low)' },
  { value: 'name-asc', label: 'Name A-Z' },
  { value: 'name-desc', label: 'Name Z-A' },
]

function selectSort(option: NFTSortOption): void {
  emit('update:modelValue', option)
  isOpen.value = false
}

function getLabel(value: NFTSortOption): string {
  return sortOptions.find(o => o.value === value)?.label || 'Sort'
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
          d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"
        />
      </svg>
      <span>{{ getLabel(modelValue) }}</span>
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
        class="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10"
      >
        <div class="py-1">
          <button
            v-for="option in sortOptions"
            :key="option.value"
            class="w-full flex items-center justify-between px-4 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            :class="{
              'text-gala-primary font-medium': modelValue === option.value,
              'text-gray-700 dark:text-gray-300': modelValue !== option.value
            }"
            @click="selectSort(option.value)"
          >
            <span>{{ option.label }}</span>
            <svg
              v-if="modelValue === option.value"
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
        </div>
      </div>
    </Transition>
  </div>
</template>
