import { useToastsStore, type ToastType, type AddToastOptions } from '@/stores/toasts';

/**
 * Composable for easy toast notifications
 *
 * Usage:
 * const toast = useToast();
 * toast.success('Operation completed!');
 * toast.error('Something went wrong');
 * toast.pending('Processing...');
 * toast.info('Here is some information');
 */
export function useToast() {
  const store = useToastsStore();

  /**
   * Show a success toast (auto-dismisses after 5 seconds)
   */
  function success(message: string, title?: string, options?: { duration?: number }) {
    return store.success(message, title, options?.duration);
  }

  /**
   * Show an error toast (does not auto-dismiss)
   */
  function error(message: string, title?: string, options?: { duration?: number }) {
    return store.error(message, title, options?.duration);
  }

  /**
   * Show a pending toast (does not auto-dismiss, not dismissible)
   * Returns the toast ID so it can be updated/removed when the operation completes
   */
  function pending(message: string, title?: string) {
    return store.pending(message, title);
  }

  /**
   * Show an info toast (auto-dismisses after 5 seconds)
   */
  function info(message: string, title?: string, options?: { duration?: number }) {
    return store.info(message, title, options?.duration);
  }

  /**
   * Add a custom toast with full options
   */
  function add(options: AddToastOptions) {
    return store.addToast(options);
  }

  /**
   * Remove a toast by ID
   */
  function remove(id: string) {
    return store.removeToast(id);
  }

  /**
   * Update an existing toast (useful for changing pending to success/error)
   */
  function update(id: string, updates: { type?: ToastType; message?: string; title?: string; dismissible?: boolean }) {
    return store.updateToast(id, updates);
  }

  /**
   * Clear all toasts
   */
  function clearAll() {
    store.clearAll();
  }

  /**
   * Update a pending toast to success and make it dismissible
   */
  function resolveSuccess(id: string, message: string, title?: string) {
    return store.updateToast(id, {
      type: 'success',
      message,
      title,
      dismissible: true,
      duration: 5000,
    });
  }

  /**
   * Update a pending toast to error and make it dismissible
   */
  function resolveError(id: string, message: string, title?: string) {
    return store.updateToast(id, {
      type: 'error',
      message,
      title,
      dismissible: true,
    });
  }

  /**
   * Show a transaction pending toast and return helpers to resolve it
   *
   * Usage:
   * const tx = toast.transaction('Transferring tokens...');
   * try {
   *   await transfer();
   *   tx.success('Tokens transferred successfully!');
   * } catch (e) {
   *   tx.error('Transfer failed: ' + e.message);
   * }
   */
  function transaction(message: string, title?: string) {
    const id = pending(message, title ?? 'Transaction Pending');

    return {
      id,
      success: (msg: string, successTitle?: string) => {
        store.updateToast(id, {
          type: 'success',
          message: msg,
          title: successTitle ?? 'Transaction Complete',
          dismissible: true,
          duration: 5000,
        });
      },
      error: (msg: string, errorTitle?: string) => {
        store.updateToast(id, {
          type: 'error',
          message: msg,
          title: errorTitle ?? 'Transaction Failed',
          dismissible: true,
        });
      },
      dismiss: () => store.removeToast(id),
    };
  }

  return {
    success,
    error,
    pending,
    info,
    add,
    remove,
    update,
    clearAll,
    resolveSuccess,
    resolveError,
    transaction,
  };
}

export type UseToastReturn = ReturnType<typeof useToast>;
