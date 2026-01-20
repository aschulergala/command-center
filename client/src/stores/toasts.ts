import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export type ToastType = 'success' | 'error' | 'pending' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  title?: string;
  duration: number;
  dismissible: boolean;
  createdAt: number;
}

export interface AddToastOptions {
  type: ToastType;
  message: string;
  title?: string;
  duration?: number;
  dismissible?: boolean;
}

// Default durations for each toast type
const DEFAULT_DURATIONS: Record<ToastType, number> = {
  success: 5000,
  info: 5000,
  pending: 0, // Pending toasts don't auto-dismiss
  error: 0,   // Error toasts don't auto-dismiss
};

// Generate unique ID
function generateId(): string {
  return `toast-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export const useToastsStore = defineStore('toasts', () => {
  // State
  const toasts = ref<Toast[]>([]);

  // Getters
  const activeToasts = computed(() => toasts.value);
  const hasToasts = computed(() => toasts.value.length > 0);
  const toastCount = computed(() => toasts.value.length);

  // Actions
  function addToast(options: AddToastOptions): string {
    const id = generateId();
    const defaultDuration = DEFAULT_DURATIONS[options.type];

    const toast: Toast = {
      id,
      type: options.type,
      message: options.message,
      title: options.title,
      duration: options.duration ?? defaultDuration,
      dismissible: options.dismissible ?? true,
      createdAt: Date.now(),
    };

    toasts.value.push(toast);
    return id;
  }

  function removeToast(id: string): boolean {
    const index = toasts.value.findIndex(t => t.id === id);
    if (index !== -1) {
      toasts.value.splice(index, 1);
      return true;
    }
    return false;
  }

  function clearAll(): void {
    toasts.value = [];
  }

  function getToastById(id: string): Toast | undefined {
    return toasts.value.find(t => t.id === id);
  }

  function updateToast(id: string, updates: Partial<Omit<Toast, 'id' | 'createdAt'>>): boolean {
    const toast = toasts.value.find(t => t.id === id);
    if (toast) {
      Object.assign(toast, updates);
      return true;
    }
    return false;
  }

  // Convenience methods for common toast types
  function success(message: string, title?: string, duration?: number): string {
    return addToast({ type: 'success', message, title, duration });
  }

  function error(message: string, title?: string, duration?: number): string {
    return addToast({ type: 'error', message, title, duration });
  }

  function pending(message: string, title?: string): string {
    return addToast({ type: 'pending', message, title, duration: 0, dismissible: false });
  }

  function info(message: string, title?: string, duration?: number): string {
    return addToast({ type: 'info', message, title, duration });
  }

  return {
    // State
    toasts,
    // Getters
    activeToasts,
    hasToasts,
    toastCount,
    // Actions
    addToast,
    removeToast,
    clearAll,
    getToastById,
    updateToast,
    // Convenience methods
    success,
    error,
    pending,
    info,
  };
});
