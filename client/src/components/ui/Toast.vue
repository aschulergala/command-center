<script setup lang="ts">
import type { Toast } from '@/stores/toasts';

defineProps<{
  toast: Toast;
}>();

const emit = defineEmits<{
  dismiss: [];
}>();

const iconMap = {
  success: 'M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z',
  error: 'M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z',
  pending: '',
  info: 'M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z',
};

const colorMap = {
  success: 'text-emerald-400',
  error: 'text-red-400',
  pending: 'text-gala-400',
  info: 'text-blue-400',
};
</script>

<template>
  <div class="flex items-start gap-3 rounded-lg border border-surface-700 bg-surface-900 px-4 py-3 shadow-lg">
    <!-- Spinner for pending, SVG icon for others -->
    <div v-if="toast.type === 'pending'" class="mt-0.5 h-5 w-5 animate-spin rounded-full border-2 border-surface-600 border-t-gala-500" />
    <svg v-else class="mt-0.5 h-5 w-5 flex-shrink-0" :class="colorMap[toast.type]" viewBox="0 0 20 20" fill="currentColor">
      <path fill-rule="evenodd" :d="iconMap[toast.type]" clip-rule="evenodd" />
    </svg>
    <p class="flex-1 text-sm text-surface-200">{{ toast.message }}</p>
    <button
      aria-label="Dismiss notification"
      class="flex-shrink-0 text-surface-500 hover:text-surface-300"
      @click="emit('dismiss')"
    >
      <svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
      </svg>
    </button>
  </div>
</template>
