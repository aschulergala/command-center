<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import type { Toast, ToastType } from '@/stores/toasts';

const props = defineProps<{
  toast: Toast;
}>();

const emit = defineEmits<{
  dismiss: [id: string];
}>();

// Auto-dismiss timer
const timerId = ref<number | null>(null);

// Icon components based on toast type
const iconMap: Record<ToastType, string> = {
  success: `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
  </svg>`,
  error: `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
  </svg>`,
  pending: `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <circle cx="12" cy="12" r="10" stroke-width="4" class="opacity-25"></circle>
    <path stroke-linecap="round" stroke-width="4" class="opacity-75" d="M4 12a8 8 0 018-8"></path>
  </svg>`,
  info: `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
  </svg>`,
};

// Computed styles based on toast type
const containerClasses = computed(() => {
  const baseClasses = 'flex items-start gap-3 w-full max-w-sm p-4 rounded-lg shadow-lg border';

  const typeClasses: Record<ToastType, string> = {
    success: 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/50 dark:border-green-700 dark:text-green-200',
    error: 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/50 dark:border-red-700 dark:text-red-200',
    pending: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/50 dark:border-blue-700 dark:text-blue-200',
    info: 'bg-gray-50 border-gray-200 text-gray-800 dark:bg-gray-800/50 dark:border-gray-600 dark:text-gray-200',
  };

  return `${baseClasses} ${typeClasses[props.toast.type]}`;
});

const iconClasses = computed(() => {
  const typeClasses: Record<ToastType, string> = {
    success: 'text-green-500 dark:text-green-400',
    error: 'text-red-500 dark:text-red-400',
    pending: 'text-blue-500 dark:text-blue-400',
    info: 'text-gray-500 dark:text-gray-400',
  };

  return `flex-shrink-0 ${typeClasses[props.toast.type]}`;
});

const dismissButtonClasses = computed(() => {
  const typeClasses: Record<ToastType, string> = {
    success: 'text-green-500 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300',
    error: 'text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300',
    pending: 'text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300',
    info: 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300',
  };

  return `flex-shrink-0 p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors ${typeClasses[props.toast.type]}`;
});

function handleDismiss() {
  emit('dismiss', props.toast.id);
}

// Set up auto-dismiss timer
onMounted(() => {
  if (props.toast.duration > 0) {
    timerId.value = window.setTimeout(() => {
      emit('dismiss', props.toast.id);
    }, props.toast.duration);
  }
});

// Clean up timer on unmount
onUnmounted(() => {
  if (timerId.value !== null) {
    clearTimeout(timerId.value);
  }
});
</script>

<template>
  <div
    :class="containerClasses"
    role="alert"
    aria-live="assertive"
    :aria-atomic="true"
  >
    <!-- Icon -->
    <div :class="iconClasses" v-html="iconMap[toast.type]"></div>

    <!-- Content -->
    <div class="flex-1 min-w-0">
      <p v-if="toast.title" class="font-semibold text-sm">
        {{ toast.title }}
      </p>
      <p class="text-sm" :class="{ 'mt-1': toast.title }">
        {{ toast.message }}
      </p>
    </div>

    <!-- Dismiss button -->
    <button
      v-if="toast.dismissible"
      type="button"
      :class="dismissButtonClasses"
      @click="handleDismiss"
      aria-label="Dismiss notification"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
      </svg>
    </button>
  </div>
</template>
