import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import ToastContainer from '../../../src/components/ui/ToastContainer.vue';
import { useToastsStore } from '../../../src/stores/toasts';

describe('ToastContainer.vue', () => {
  beforeEach(() => {
    // Clear any previous body contents from Teleport
    document.body.innerHTML = '';
    setActivePinia(createPinia());
  });

  it('should render empty when no toasts', () => {
    mount(ToastContainer);

    // ToastContainer uses Teleport, so we check the body
    const container = document.body.querySelector('[aria-label="Notifications"]');
    expect(container).toBeTruthy();

    // Should not have any toast children
    const toasts = container?.querySelectorAll('[role="alert"]');
    expect(toasts?.length).toBe(0);
  });

  it('should render toasts from store', async () => {
    const store = useToastsStore();
    store.addToast({ type: 'success', message: 'First toast' });
    store.addToast({ type: 'error', message: 'Second toast' });

    mount(ToastContainer);

    // Wait for Vue to update the DOM
    await new Promise((resolve) => setTimeout(resolve, 0));

    const container = document.body.querySelector('[aria-label="Notifications"]');
    const toasts = container?.querySelectorAll('[role="alert"]');

    expect(toasts?.length).toBe(2);
  });

  it('should remove toast when dismiss is clicked', async () => {
    const store = useToastsStore();
    store.addToast({ type: 'success', message: 'Dismissible toast', dismissible: true });

    mount(ToastContainer);

    await new Promise((resolve) => setTimeout(resolve, 0));

    // Find and click dismiss button
    const dismissButton = document.body.querySelector('[aria-label="Dismiss notification"]');
    expect(dismissButton).toBeTruthy();

    (dismissButton as HTMLButtonElement).click();

    // Wait for Vue to update
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(store.toasts.length).toBe(0);
  });

  it('should be positioned fixed at bottom right', () => {
    mount(ToastContainer);

    const container = document.body.querySelector('[aria-label="Notifications"]');
    expect(container?.classList.contains('fixed')).toBe(true);
    expect(container?.classList.contains('bottom-4')).toBe(true);
    expect(container?.classList.contains('right-4')).toBe(true);
  });

  it('should have z-50 for proper layering', () => {
    mount(ToastContainer);

    const container = document.body.querySelector('[aria-label="Notifications"]');
    expect(container?.classList.contains('z-50')).toBe(true);
  });

  it('should display toasts in order they were added', async () => {
    const store = useToastsStore();
    store.addToast({ type: 'success', message: 'First' });
    store.addToast({ type: 'error', message: 'Second' });
    store.addToast({ type: 'info', message: 'Third' });

    mount(ToastContainer);

    await new Promise((resolve) => setTimeout(resolve, 0));

    const toasts = document.body.querySelectorAll('[role="alert"]');
    expect(toasts.length).toBe(3);

    // Check order
    expect(toasts[0].textContent).toContain('First');
    expect(toasts[1].textContent).toContain('Second');
    expect(toasts[2].textContent).toContain('Third');
  });

  it('should update when toasts are added to store', async () => {
    const store = useToastsStore();

    mount(ToastContainer);

    // Initially no toasts
    await new Promise((resolve) => setTimeout(resolve, 0));
    let toasts = document.body.querySelectorAll('[role="alert"]');
    expect(toasts.length).toBe(0);

    // Add a toast
    store.addToast({ type: 'success', message: 'New toast' });

    await new Promise((resolve) => setTimeout(resolve, 0));
    toasts = document.body.querySelectorAll('[role="alert"]');
    expect(toasts.length).toBe(1);
  });

  it('should update when toasts are removed from store', async () => {
    const store = useToastsStore();
    const id = store.addToast({ type: 'success', message: 'Will be removed' });

    mount(ToastContainer);

    await new Promise((resolve) => setTimeout(resolve, 0));
    let toasts = document.body.querySelectorAll('[role="alert"]');
    expect(toasts.length).toBe(1);

    // Remove the toast
    store.removeToast(id);

    await new Promise((resolve) => setTimeout(resolve, 0));
    toasts = document.body.querySelectorAll('[role="alert"]');
    expect(toasts.length).toBe(0);
  });
});
