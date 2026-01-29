<script setup lang="ts">
import { useToastStore } from '@/stores/toasts';
import Toast from './Toast.vue';

const toastStore = useToastStore();
</script>

<template>
  <div class="pointer-events-none fixed bottom-4 right-4 z-50 flex flex-col gap-2" aria-live="polite">
    <TransitionGroup
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="translate-x-4 opacity-0"
      enter-to-class="translate-x-0 opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="translate-x-0 opacity-100"
      leave-to-class="translate-x-4 opacity-0"
    >
      <div
        v-for="toast in toastStore.toasts"
        :key="toast.id"
        class="pointer-events-auto w-80"
      >
        <Toast
          :toast="toast"
          @dismiss="toastStore.remove(toast.id)"
        />
      </div>
    </TransitionGroup>
  </div>
</template>
