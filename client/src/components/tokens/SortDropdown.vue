<script setup lang="ts">
import type { SortOption } from '@/stores/tokens';

defineProps<{
  modelValue: SortOption;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: SortOption];
}>();

const options: { value: SortOption; label: string }[] = [
  { value: 'name', label: 'Name (A-Z)' },
  { value: 'balance-high', label: 'Balance (High-Low)' },
  { value: 'balance-low', label: 'Balance (Low-High)' },
];
</script>

<template>
  <div class="relative inline-block">
    <label for="sort-tokens" class="sr-only">Sort tokens</label>
    <select
      id="sort-tokens"
      :value="modelValue"
      class="input appearance-none pr-8 text-sm"
      @change="emit('update:modelValue', ($event.target as HTMLSelectElement).value as SortOption)"
    >
      <option
        v-for="option in options"
        :key="option.value"
        :value="option.value"
      >
        {{ option.label }}
      </option>
    </select>
    <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
      <svg class="h-4 w-4 text-surface-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clip-rule="evenodd" />
      </svg>
    </div>
  </div>
</template>
