import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import Toast from '../../../src/components/ui/Toast.vue';
import type { Toast as ToastType, ToastType as ToastVariant } from '../../../src/stores/toasts';

function createToast(overrides: Partial<ToastType> = {}): ToastType {
  return {
    id: 'test-toast-1',
    type: 'success',
    message: 'Test message',
    title: undefined,
    duration: 5000,
    dismissible: true,
    createdAt: Date.now(),
    ...overrides,
  };
}

describe('Toast.vue', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('rendering', () => {
    it('should render toast message', () => {
      const toast = createToast({ message: 'Operation successful!' });
      const wrapper = mount(Toast, {
        props: { toast },
      });

      expect(wrapper.text()).toContain('Operation successful!');
    });

    it('should render toast title when provided', () => {
      const toast = createToast({ title: 'Success' });
      const wrapper = mount(Toast, {
        props: { toast },
      });

      expect(wrapper.text()).toContain('Success');
    });

    it('should not render title element when title is undefined', () => {
      const toast = createToast({ title: undefined });
      const wrapper = mount(Toast, {
        props: { toast },
      });

      // Should only have message, no title
      const paragraphs = wrapper.findAll('p');
      expect(paragraphs.length).toBe(1);
    });

    it('should have role="alert" for accessibility', () => {
      const toast = createToast();
      const wrapper = mount(Toast, {
        props: { toast },
      });

      expect(wrapper.attributes('role')).toBe('alert');
    });

    it('should have aria-live="assertive"', () => {
      const toast = createToast();
      const wrapper = mount(Toast, {
        props: { toast },
      });

      expect(wrapper.attributes('aria-live')).toBe('assertive');
    });
  });

  describe('toast types styling', () => {
    it.each<ToastVariant>(['success', 'error', 'pending', 'info'])(
      'should render %s toast type',
      (type) => {
        const toast = createToast({ type });
        const wrapper = mount(Toast, {
          props: { toast },
        });

        expect(wrapper.html()).toBeDefined();
      }
    );

    it('should have green styling for success toast', () => {
      const toast = createToast({ type: 'success' });
      const wrapper = mount(Toast, {
        props: { toast },
      });

      expect(wrapper.classes().join(' ')).toContain('green');
    });

    it('should have red styling for error toast', () => {
      const toast = createToast({ type: 'error' });
      const wrapper = mount(Toast, {
        props: { toast },
      });

      expect(wrapper.classes().join(' ')).toContain('red');
    });

    it('should have blue styling for pending toast', () => {
      const toast = createToast({ type: 'pending' });
      const wrapper = mount(Toast, {
        props: { toast },
      });

      expect(wrapper.classes().join(' ')).toContain('blue');
    });

    it('should have gray styling for info toast', () => {
      const toast = createToast({ type: 'info' });
      const wrapper = mount(Toast, {
        props: { toast },
      });

      expect(wrapper.classes().join(' ')).toContain('gray');
    });
  });

  describe('dismiss button', () => {
    it('should show dismiss button when dismissible is true', () => {
      const toast = createToast({ dismissible: true });
      const wrapper = mount(Toast, {
        props: { toast },
      });

      expect(wrapper.find('button').exists()).toBe(true);
    });

    it('should hide dismiss button when dismissible is false', () => {
      const toast = createToast({ dismissible: false });
      const wrapper = mount(Toast, {
        props: { toast },
      });

      expect(wrapper.find('button').exists()).toBe(false);
    });

    it('should emit dismiss event when button clicked', async () => {
      const toast = createToast({ id: 'toast-123' });
      const wrapper = mount(Toast, {
        props: { toast },
      });

      await wrapper.find('button').trigger('click');

      expect(wrapper.emitted('dismiss')).toBeTruthy();
      expect(wrapper.emitted('dismiss')![0]).toEqual(['toast-123']);
    });

    it('should have accessible label on dismiss button', () => {
      const toast = createToast({ dismissible: true });
      const wrapper = mount(Toast, {
        props: { toast },
      });

      const button = wrapper.find('button');
      expect(button.attributes('aria-label')).toBe('Dismiss notification');
    });
  });

  describe('auto-dismiss', () => {
    it('should emit dismiss after duration expires', () => {
      const toast = createToast({ duration: 3000 });
      const wrapper = mount(Toast, {
        props: { toast },
      });

      // Fast-forward time
      vi.advanceTimersByTime(3000);

      expect(wrapper.emitted('dismiss')).toBeTruthy();
      expect(wrapper.emitted('dismiss')![0]).toEqual([toast.id]);
    });

    it('should not auto-dismiss when duration is 0', () => {
      const toast = createToast({ duration: 0 });
      const wrapper = mount(Toast, {
        props: { toast },
      });

      // Fast-forward time
      vi.advanceTimersByTime(10000);

      expect(wrapper.emitted('dismiss')).toBeFalsy();
    });

    it('should not emit dismiss before duration expires', () => {
      const toast = createToast({ duration: 5000 });
      const wrapper = mount(Toast, {
        props: { toast },
      });

      // Fast-forward time, but not enough
      vi.advanceTimersByTime(4999);

      expect(wrapper.emitted('dismiss')).toBeFalsy();
    });
  });

  describe('icon rendering', () => {
    it('should render success icon (checkmark)', () => {
      const toast = createToast({ type: 'success' });
      const wrapper = mount(Toast, {
        props: { toast },
      });

      // Success icon has a checkmark path
      expect(wrapper.html()).toContain('svg');
    });

    it('should render error icon (x)', () => {
      const toast = createToast({ type: 'error' });
      const wrapper = mount(Toast, {
        props: { toast },
      });

      expect(wrapper.html()).toContain('svg');
    });

    it('should render pending icon (spinner)', () => {
      const toast = createToast({ type: 'pending' });
      const wrapper = mount(Toast, {
        props: { toast },
      });

      // Pending icon has animate-spin class
      expect(wrapper.html()).toContain('animate-spin');
    });

    it('should render info icon (i)', () => {
      const toast = createToast({ type: 'info' });
      const wrapper = mount(Toast, {
        props: { toast },
      });

      expect(wrapper.html()).toContain('svg');
    });
  });
});
