<script setup lang="ts">
import { computed } from 'vue';
import { useToastsStore } from '@/stores/toasts';
import Toast from './Toast.vue';

const toastsStore = useToastsStore();

const activeToasts = computed(() => toastsStore.activeToasts);

function handleDismiss(id: string) {
  toastsStore.removeToast(id);
}
</script>

<template>
  <Teleport to="body">
    <div
      class="fixed bottom-4 right-4 z-50 flex flex-col gap-3 items-end"
      aria-label="Notifications"
    >
      <TransitionGroup
        name="toast"
        tag="div"
        class="flex flex-col gap-3"
      >
        <Toast
          v-for="toast in activeToasts"
          :key="toast.id"
          :toast="toast"
          @dismiss="handleDismiss"
        />
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
/* Enter animation */
.toast-enter-active {
  transition: all 0.3s ease-out;
}

/* Leave animation */
.toast-leave-active {
  transition: all 0.2s ease-in;
}

/* Enter from (starting state) */
.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

/* Leave to (ending state) */
.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

/* Move animation for reordering */
.toast-move {
  transition: transform 0.3s ease;
}
</style>
