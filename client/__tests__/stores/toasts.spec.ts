import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useToastsStore, type ToastType } from '../../src/stores/toasts';

describe('toasts store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  describe('initial state', () => {
    it('should have empty toasts array', () => {
      const store = useToastsStore();
      expect(store.toasts).toEqual([]);
    });

    it('should have hasToasts return false', () => {
      const store = useToastsStore();
      expect(store.hasToasts).toBe(false);
    });

    it('should have toastCount return 0', () => {
      const store = useToastsStore();
      expect(store.toastCount).toBe(0);
    });
  });

  describe('addToast', () => {
    it('should add a toast with generated id', () => {
      const store = useToastsStore();
      const id = store.addToast({ type: 'success', message: 'Test message' });

      expect(id).toMatch(/^toast-\d+-[a-z0-9]+$/);
      expect(store.toasts.length).toBe(1);
      expect(store.toasts[0].id).toBe(id);
    });

    it('should add toast with correct type and message', () => {
      const store = useToastsStore();
      store.addToast({ type: 'error', message: 'Error occurred' });

      expect(store.toasts[0].type).toBe('error');
      expect(store.toasts[0].message).toBe('Error occurred');
    });

    it('should add toast with optional title', () => {
      const store = useToastsStore();
      store.addToast({ type: 'info', message: 'Info message', title: 'Info Title' });

      expect(store.toasts[0].title).toBe('Info Title');
    });

    it('should use default duration for success toasts (5000ms)', () => {
      const store = useToastsStore();
      store.addToast({ type: 'success', message: 'Success' });

      expect(store.toasts[0].duration).toBe(5000);
    });

    it('should use default duration for info toasts (5000ms)', () => {
      const store = useToastsStore();
      store.addToast({ type: 'info', message: 'Info' });

      expect(store.toasts[0].duration).toBe(5000);
    });

    it('should use 0 duration for error toasts (no auto-dismiss)', () => {
      const store = useToastsStore();
      store.addToast({ type: 'error', message: 'Error' });

      expect(store.toasts[0].duration).toBe(0);
    });

    it('should use 0 duration for pending toasts (no auto-dismiss)', () => {
      const store = useToastsStore();
      store.addToast({ type: 'pending', message: 'Pending' });

      expect(store.toasts[0].duration).toBe(0);
    });

    it('should allow custom duration override', () => {
      const store = useToastsStore();
      store.addToast({ type: 'success', message: 'Success', duration: 10000 });

      expect(store.toasts[0].duration).toBe(10000);
    });

    it('should default dismissible to true', () => {
      const store = useToastsStore();
      store.addToast({ type: 'success', message: 'Success' });

      expect(store.toasts[0].dismissible).toBe(true);
    });

    it('should allow setting dismissible to false', () => {
      const store = useToastsStore();
      store.addToast({ type: 'pending', message: 'Pending', dismissible: false });

      expect(store.toasts[0].dismissible).toBe(false);
    });

    it('should set createdAt timestamp', () => {
      const store = useToastsStore();
      const before = Date.now();
      store.addToast({ type: 'success', message: 'Success' });
      const after = Date.now();

      expect(store.toasts[0].createdAt).toBeGreaterThanOrEqual(before);
      expect(store.toasts[0].createdAt).toBeLessThanOrEqual(after);
    });

    it('should add multiple toasts', () => {
      const store = useToastsStore();
      store.addToast({ type: 'success', message: 'First' });
      store.addToast({ type: 'error', message: 'Second' });
      store.addToast({ type: 'info', message: 'Third' });

      expect(store.toasts.length).toBe(3);
      expect(store.hasToasts).toBe(true);
      expect(store.toastCount).toBe(3);
    });
  });

  describe('removeToast', () => {
    it('should remove toast by id', () => {
      const store = useToastsStore();
      const id = store.addToast({ type: 'success', message: 'Test' });

      const result = store.removeToast(id);

      expect(result).toBe(true);
      expect(store.toasts.length).toBe(0);
    });

    it('should return false for non-existent id', () => {
      const store = useToastsStore();
      const result = store.removeToast('non-existent-id');

      expect(result).toBe(false);
    });

    it('should only remove the specified toast', () => {
      const store = useToastsStore();
      const id1 = store.addToast({ type: 'success', message: 'First' });
      const id2 = store.addToast({ type: 'error', message: 'Second' });

      store.removeToast(id1);

      expect(store.toasts.length).toBe(1);
      expect(store.toasts[0].id).toBe(id2);
    });
  });

  describe('clearAll', () => {
    it('should remove all toasts', () => {
      const store = useToastsStore();
      store.addToast({ type: 'success', message: 'First' });
      store.addToast({ type: 'error', message: 'Second' });
      store.addToast({ type: 'info', message: 'Third' });

      store.clearAll();

      expect(store.toasts.length).toBe(0);
      expect(store.hasToasts).toBe(false);
    });

    it('should work when toasts are already empty', () => {
      const store = useToastsStore();
      store.clearAll();

      expect(store.toasts.length).toBe(0);
    });
  });

  describe('getToastById', () => {
    it('should return toast when it exists', () => {
      const store = useToastsStore();
      const id = store.addToast({ type: 'success', message: 'Test' });

      const toast = store.getToastById(id);

      expect(toast).toBeDefined();
      expect(toast?.id).toBe(id);
      expect(toast?.message).toBe('Test');
    });

    it('should return undefined for non-existent id', () => {
      const store = useToastsStore();
      const toast = store.getToastById('non-existent');

      expect(toast).toBeUndefined();
    });
  });

  describe('updateToast', () => {
    it('should update toast message', () => {
      const store = useToastsStore();
      const id = store.addToast({ type: 'pending', message: 'Processing...' });

      store.updateToast(id, { message: 'Complete!' });

      expect(store.toasts[0].message).toBe('Complete!');
    });

    it('should update toast type', () => {
      const store = useToastsStore();
      const id = store.addToast({ type: 'pending', message: 'Processing...' });

      store.updateToast(id, { type: 'success' });

      expect(store.toasts[0].type).toBe('success');
    });

    it('should update multiple fields', () => {
      const store = useToastsStore();
      const id = store.addToast({ type: 'pending', message: 'Processing...', dismissible: false });

      store.updateToast(id, {
        type: 'error',
        message: 'Failed!',
        title: 'Error',
        dismissible: true,
      });

      expect(store.toasts[0].type).toBe('error');
      expect(store.toasts[0].message).toBe('Failed!');
      expect(store.toasts[0].title).toBe('Error');
      expect(store.toasts[0].dismissible).toBe(true);
    });

    it('should return true on successful update', () => {
      const store = useToastsStore();
      const id = store.addToast({ type: 'success', message: 'Test' });

      const result = store.updateToast(id, { message: 'Updated' });

      expect(result).toBe(true);
    });

    it('should return false for non-existent id', () => {
      const store = useToastsStore();
      const result = store.updateToast('non-existent', { message: 'Updated' });

      expect(result).toBe(false);
    });

    it('should preserve id and createdAt', () => {
      const store = useToastsStore();
      const id = store.addToast({ type: 'pending', message: 'Processing...' });
      const originalCreatedAt = store.toasts[0].createdAt;

      store.updateToast(id, { type: 'success', message: 'Done!' });

      expect(store.toasts[0].id).toBe(id);
      expect(store.toasts[0].createdAt).toBe(originalCreatedAt);
    });
  });

  describe('convenience methods', () => {
    it('success() should create success toast', () => {
      const store = useToastsStore();
      const id = store.success('Operation successful');

      expect(store.toasts[0].type).toBe('success');
      expect(store.toasts[0].message).toBe('Operation successful');
      expect(id).toBeDefined();
    });

    it('success() should accept title', () => {
      const store = useToastsStore();
      store.success('Operation successful', 'Success!');

      expect(store.toasts[0].title).toBe('Success!');
    });

    it('success() should accept custom duration', () => {
      const store = useToastsStore();
      store.success('Operation successful', undefined, 3000);

      expect(store.toasts[0].duration).toBe(3000);
    });

    it('error() should create error toast', () => {
      const store = useToastsStore();
      const id = store.error('Something went wrong');

      expect(store.toasts[0].type).toBe('error');
      expect(store.toasts[0].message).toBe('Something went wrong');
      expect(store.toasts[0].duration).toBe(0); // No auto-dismiss
      expect(id).toBeDefined();
    });

    it('error() should accept title', () => {
      const store = useToastsStore();
      store.error('Something went wrong', 'Error');

      expect(store.toasts[0].title).toBe('Error');
    });

    it('pending() should create pending toast', () => {
      const store = useToastsStore();
      const id = store.pending('Processing...');

      expect(store.toasts[0].type).toBe('pending');
      expect(store.toasts[0].message).toBe('Processing...');
      expect(store.toasts[0].duration).toBe(0); // No auto-dismiss
      expect(store.toasts[0].dismissible).toBe(false);
      expect(id).toBeDefined();
    });

    it('pending() should accept title', () => {
      const store = useToastsStore();
      store.pending('Processing...', 'Please wait');

      expect(store.toasts[0].title).toBe('Please wait');
    });

    it('info() should create info toast', () => {
      const store = useToastsStore();
      const id = store.info('Here is some information');

      expect(store.toasts[0].type).toBe('info');
      expect(store.toasts[0].message).toBe('Here is some information');
      expect(store.toasts[0].duration).toBe(5000);
      expect(id).toBeDefined();
    });

    it('info() should accept title and custom duration', () => {
      const store = useToastsStore();
      store.info('Info message', 'Info', 10000);

      expect(store.toasts[0].title).toBe('Info');
      expect(store.toasts[0].duration).toBe(10000);
    });
  });

  describe('getters', () => {
    it('activeToasts should return all toasts', () => {
      const store = useToastsStore();
      store.addToast({ type: 'success', message: 'First' });
      store.addToast({ type: 'error', message: 'Second' });

      const active = store.activeToasts;

      expect(active.length).toBe(2);
      expect(active[0].message).toBe('First');
      expect(active[1].message).toBe('Second');
    });
  });
});
