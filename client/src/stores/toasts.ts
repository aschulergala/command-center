import { defineStore } from 'pinia';
import { ref } from 'vue';

export type ToastType = 'success' | 'error' | 'pending' | 'info';

export interface Toast {
  id: number;
  type: ToastType;
  message: string;
  duration: number;
}

let nextId = 0;

export const useToastStore = defineStore('toasts', () => {
  const toasts = ref<Toast[]>([]);
  const timers = new Map<number, ReturnType<typeof setTimeout>>();

  function add(type: ToastType, message: string, duration = 5000): number {
    const id = nextId++;
    toasts.value.push({ id, type, message, duration });

    if (type !== 'pending') {
      const handle = setTimeout(() => remove(id), duration);
      timers.set(id, handle);
    }

    return id;
  }

  function remove(id: number) {
    const handle = timers.get(id);
    if (handle !== undefined) {
      clearTimeout(handle);
      timers.delete(id);
    }
    toasts.value = toasts.value.filter((t) => t.id !== id);
  }

  function success(message: string) {
    return add('success', message);
  }

  function error(message: string) {
    return add('error', message, 8000);
  }

  function pending(message: string) {
    return add('pending', message, 0);
  }

  function info(message: string) {
    return add('info', message);
  }

  function update(id: number, type: ToastType, message: string) {
    const toast = toasts.value.find((t) => t.id === id);
    if (toast) {
      toast.type = type;
      toast.message = message;

      // Clear any existing timer before scheduling a new one
      const existingHandle = timers.get(id);
      if (existingHandle !== undefined) {
        clearTimeout(existingHandle);
        timers.delete(id);
      }

      if (type !== 'pending') {
        const handle = setTimeout(() => remove(id), 5000);
        timers.set(id, handle);
      }
    }
  }

  return {
    toasts,
    add,
    remove,
    success,
    error,
    pending,
    info,
    update,
  };
});
