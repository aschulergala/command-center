<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from 'vue';

const props = defineProps<{
  open: boolean;
  title?: string;
  size?: 'sm' | 'md' | 'lg';
}>();

const emit = defineEmits<{
  close: [];
}>();

const dialogRef = ref<HTMLDialogElement | null>(null);

function handleBackdropClick(e: MouseEvent) {
  if (e.target === dialogRef.value) {
    emit('close');
  }
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    emit('close');
  }
}

watch(
  () => props.open,
  (open) => {
    if (!dialogRef.value) return;
    if (open) {
      dialogRef.value.showModal();
    } else {
      dialogRef.value.close();
    }
  },
);

onMounted(() => {
  if (props.open && dialogRef.value) {
    dialogRef.value.showModal();
  }
  document.addEventListener('keydown', handleKeydown);
});

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleKeydown);
});

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
};
</script>

<template>
  <dialog
    ref="dialogRef"
    class="fixed inset-0 z-50 m-0 h-full w-full max-w-none border-none bg-transparent p-0 backdrop:bg-black/60 md:flex md:items-center md:justify-center"
    @click="handleBackdropClick"
  >
    <div
      class="flex h-full flex-col bg-surface-900 md:h-auto md:rounded-xl md:border md:border-surface-700"
      :class="[sizeClasses[size ?? 'md'], 'md:mx-auto md:w-full']"
    >
      <!-- Header -->
      <div v-if="title || $slots.header" class="flex items-center justify-between border-b border-surface-800 px-4 py-3 md:px-5">
        <slot name="header">
          <h2 class="text-lg font-semibold text-white">{{ title }}</h2>
        </slot>
        <button
          class="rounded-lg p-1.5 text-surface-400 hover:bg-surface-800 hover:text-white"
          @click="emit('close')"
        >
          <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </button>
      </div>

      <!-- Body -->
      <div class="flex-1 overflow-y-auto px-4 py-4 md:px-5">
        <slot />
      </div>

      <!-- Footer -->
      <div v-if="$slots.footer" class="border-t border-surface-800 px-4 py-3 md:px-5">
        <slot name="footer" />
      </div>
    </div>
  </dialog>
</template>
