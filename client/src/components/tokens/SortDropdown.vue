<script setup lang="ts">
import { ref } from 'vue'
import type { TokenSortOption } from '@/stores/tokens'

interface Props {
  modelValue: TokenSortOption
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: TokenSortOption]
}>()

const isOpen = ref(false)

const sortOptions: { value: TokenSortOption; label: string }[] = [
  { value: 'balance-desc', label: 'Balance: High to Low' },
  { value: 'balance-asc', label: 'Balance: Low to High' },
  { value: 'name-asc', label: 'Name: A to Z' },
  { value: 'name-desc', label: 'Name: Z to A' },
]

function getCurrentLabel(): string {
  return sortOptions.find(o => o.value === props.modelValue)?.label || 'Sort'
}

function selectOption(value: TokenSortOption): void {
  emit('update:modelValue', value)
  isOpen.value = false
}

function toggleDropdown(): void {
  isOpen.value = !isOpen.value
}

function closeDropdown(): void {
  isOpen.value = false
}
</script>

<template>
  <div class="relative" @blur.capture="closeDropdown">
    <!-- Dropdown Button -->
    <button
      type="button"
      class="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gala-primary/20 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-700"
      @click="toggleDropdown"
    >
      <svg
        class="w-4 h-4"
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
      <span>{{ getCurrentLabel() }}</span>
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
        class="absolute right-0 z-10 mt-2 w-48 origin-top-right bg-white rounded-lg shadow-lg ring-1 ring-black/5 focus:outline-none dark:bg-gray-800 dark:ring-white/10"
      >
        <div class="py-1">
          <button
            v-for="option in sortOptions"
            :key="option.value"
            type="button"
            class="w-full px-4 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            :class="{
              'text-gala-primary font-medium bg-gala-primary/5': option.value === modelValue,
              'text-gray-700 dark:text-gray-200': option.value !== modelValue
            }"
            @click="selectOption(option.value)"
          >
            <div class="flex items-center justify-between">
              <span>{{ option.label }}</span>
              <svg
                v-if="option.value === modelValue"
                class="w-4 h-4"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fill-rule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clip-rule="evenodd"
                />
              </svg>
            </div>
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>
