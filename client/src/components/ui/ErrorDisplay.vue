<script setup lang="ts">
defineProps<{
  message: string;
  retryable?: boolean;
}>();

const emit = defineEmits<{
  retry: [];
}>();
</script>

<template>
  <div class="rounded-lg border border-red-900/50 bg-red-950/50 p-4">
    <div class="flex items-start gap-3">
      <svg class="mt-0.5 h-5 w-5 flex-shrink-0 text-red-400" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clip-rule="evenodd" />
      </svg>
      <div class="flex-1">
        <p class="text-sm text-red-300">{{ message }}</p>
        <button
          v-if="retryable"
          class="mt-2 text-sm font-medium text-red-400 hover:text-red-300"
          @click="emit('retry')"
        >
          Try again
        </button>
      </div>
    </div>
  </div>
</template>
