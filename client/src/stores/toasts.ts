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

  function add(type: ToastType, message: string, duration = 5000): number {
    const id = nextId++;
    toasts.value.push({ id, type, message, duration });

    if (type !== 'pending') {
      setTimeout(() => remove(id), duration);
    }

    return id;
  }

  function remove(id: number) {
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
      if (type !== 'pending') {
        setTimeout(() => remove(id), 5000);
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
