import { useToastStore } from '@/stores/toasts';

export function useToast() {
  const store = useToastStore();
  return {
    success: store.success,
    error: store.error,
    pending: store.pending,
    info: store.info,
    update: store.update,
    remove: store.remove,
  };
}
