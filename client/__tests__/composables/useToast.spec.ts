import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useToast } from '../../src/composables/useToast';
import { useToastsStore } from '../../src/stores/toasts';

describe('useToast', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  describe('success()', () => {
    it('should create success toast', () => {
      const toast = useToast();
      const store = useToastsStore();

      const id = toast.success('Operation completed');

      expect(store.toasts.length).toBe(1);
      expect(store.toasts[0].type).toBe('success');
      expect(store.toasts[0].message).toBe('Operation completed');
      expect(id).toBeDefined();
    });

    it('should accept optional title', () => {
      const toast = useToast();
      const store = useToastsStore();

      toast.success('Operation completed', 'Success!');

      expect(store.toasts[0].title).toBe('Success!');
    });

    it('should accept custom duration', () => {
      const toast = useToast();
      const store = useToastsStore();

      toast.success('Operation completed', undefined, { duration: 3000 });

      expect(store.toasts[0].duration).toBe(3000);
    });
  });

  describe('error()', () => {
    it('should create error toast', () => {
      const toast = useToast();
      const store = useToastsStore();

      const id = toast.error('Something went wrong');

      expect(store.toasts.length).toBe(1);
      expect(store.toasts[0].type).toBe('error');
      expect(store.toasts[0].message).toBe('Something went wrong');
      expect(id).toBeDefined();
    });

    it('should not auto-dismiss by default', () => {
      const toast = useToast();
      const store = useToastsStore();

      toast.error('Something went wrong');

      expect(store.toasts[0].duration).toBe(0);
    });
  });

  describe('pending()', () => {
    it('should create pending toast', () => {
      const toast = useToast();
      const store = useToastsStore();

      const id = toast.pending('Processing...');

      expect(store.toasts.length).toBe(1);
      expect(store.toasts[0].type).toBe('pending');
      expect(store.toasts[0].message).toBe('Processing...');
      expect(id).toBeDefined();
    });

    it('should not be dismissible', () => {
      const toast = useToast();
      const store = useToastsStore();

      toast.pending('Processing...');

      expect(store.toasts[0].dismissible).toBe(false);
    });

    it('should not auto-dismiss', () => {
      const toast = useToast();
      const store = useToastsStore();

      toast.pending('Processing...');

      expect(store.toasts[0].duration).toBe(0);
    });
  });

  describe('info()', () => {
    it('should create info toast', () => {
      const toast = useToast();
      const store = useToastsStore();

      const id = toast.info('Here is some information');

      expect(store.toasts.length).toBe(1);
      expect(store.toasts[0].type).toBe('info');
      expect(store.toasts[0].message).toBe('Here is some information');
      expect(id).toBeDefined();
    });

    it('should auto-dismiss after 5 seconds by default', () => {
      const toast = useToast();
      const store = useToastsStore();

      toast.info('Information');

      expect(store.toasts[0].duration).toBe(5000);
    });
  });

  describe('add()', () => {
    it('should add custom toast with full options', () => {
      const toast = useToast();
      const store = useToastsStore();

      toast.add({
        type: 'success',
        message: 'Custom toast',
        title: 'Custom Title',
        duration: 7000,
        dismissible: false,
      });

      expect(store.toasts[0].type).toBe('success');
      expect(store.toasts[0].message).toBe('Custom toast');
      expect(store.toasts[0].title).toBe('Custom Title');
      expect(store.toasts[0].duration).toBe(7000);
      expect(store.toasts[0].dismissible).toBe(false);
    });
  });

  describe('remove()', () => {
    it('should remove toast by id', () => {
      const toast = useToast();
      const store = useToastsStore();

      const id = toast.success('Will be removed');
      expect(store.toasts.length).toBe(1);

      const result = toast.remove(id);

      expect(result).toBe(true);
      expect(store.toasts.length).toBe(0);
    });
  });

  describe('update()', () => {
    it('should update existing toast', () => {
      const toast = useToast();
      const store = useToastsStore();

      const id = toast.pending('Loading...');
      toast.update(id, { type: 'success', message: 'Done!', dismissible: true });

      expect(store.toasts[0].type).toBe('success');
      expect(store.toasts[0].message).toBe('Done!');
      expect(store.toasts[0].dismissible).toBe(true);
    });
  });

  describe('clearAll()', () => {
    it('should clear all toasts', () => {
      const toast = useToast();
      const store = useToastsStore();

      toast.success('First');
      toast.error('Second');
      toast.info('Third');
      expect(store.toasts.length).toBe(3);

      toast.clearAll();

      expect(store.toasts.length).toBe(0);
    });
  });

  describe('resolveSuccess()', () => {
    it('should update pending toast to success', () => {
      const toast = useToast();
      const store = useToastsStore();

      const id = toast.pending('Loading...');
      toast.resolveSuccess(id, 'Completed successfully!');

      expect(store.toasts[0].type).toBe('success');
      expect(store.toasts[0].message).toBe('Completed successfully!');
      expect(store.toasts[0].dismissible).toBe(true);
      expect(store.toasts[0].duration).toBe(5000);
    });

    it('should update title if provided', () => {
      const toast = useToast();
      const store = useToastsStore();

      const id = toast.pending('Loading...');
      toast.resolveSuccess(id, 'Done!', 'Success');

      expect(store.toasts[0].title).toBe('Success');
    });
  });

  describe('resolveError()', () => {
    it('should update pending toast to error', () => {
      const toast = useToast();
      const store = useToastsStore();

      const id = toast.pending('Loading...');
      toast.resolveError(id, 'Operation failed!');

      expect(store.toasts[0].type).toBe('error');
      expect(store.toasts[0].message).toBe('Operation failed!');
      expect(store.toasts[0].dismissible).toBe(true);
    });
  });

  describe('transaction()', () => {
    it('should create pending transaction toast', () => {
      const toast = useToast();
      const store = useToastsStore();

      const tx = toast.transaction('Signing transaction...');

      expect(tx.id).toBeDefined();
      expect(store.toasts[0].type).toBe('pending');
      expect(store.toasts[0].message).toBe('Signing transaction...');
      expect(store.toasts[0].title).toBe('Transaction Pending');
    });

    it('should resolve to success', () => {
      const toast = useToast();
      const store = useToastsStore();

      const tx = toast.transaction('Signing...');
      tx.success('Transaction completed!');

      expect(store.toasts[0].type).toBe('success');
      expect(store.toasts[0].message).toBe('Transaction completed!');
      expect(store.toasts[0].title).toBe('Transaction Complete');
      expect(store.toasts[0].dismissible).toBe(true);
    });

    it('should resolve to error', () => {
      const toast = useToast();
      const store = useToastsStore();

      const tx = toast.transaction('Signing...');
      tx.error('Transaction rejected');

      expect(store.toasts[0].type).toBe('error');
      expect(store.toasts[0].message).toBe('Transaction rejected');
      expect(store.toasts[0].title).toBe('Transaction Failed');
      expect(store.toasts[0].dismissible).toBe(true);
    });

    it('should allow custom success title', () => {
      const toast = useToast();
      const store = useToastsStore();

      const tx = toast.transaction('Transferring...');
      tx.success('Tokens sent!', 'Transfer Complete');

      expect(store.toasts[0].title).toBe('Transfer Complete');
    });

    it('should allow custom error title', () => {
      const toast = useToast();
      const store = useToastsStore();

      const tx = toast.transaction('Transferring...');
      tx.error('Insufficient balance', 'Transfer Failed');

      expect(store.toasts[0].title).toBe('Transfer Failed');
    });

    it('should allow dismissing the toast', () => {
      const toast = useToast();
      const store = useToastsStore();

      const tx = toast.transaction('Processing...');
      expect(store.toasts.length).toBe(1);

      tx.dismiss();

      expect(store.toasts.length).toBe(0);
    });
  });
});
