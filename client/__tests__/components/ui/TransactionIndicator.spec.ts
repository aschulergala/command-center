import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import TransactionIndicator from '../../../src/components/ui/TransactionIndicator.vue';
import { useTransactionsStore, TransactionType, TransactionStatus } from '../../../src/stores/transactions';
import type { PendingTransaction } from '@shared/types/display';

function createMockTransaction(overrides: Partial<PendingTransaction> = {}): PendingTransaction {
  return {
    id: 'tx-123',
    type: TransactionType.Transfer,
    status: TransactionStatus.Pending,
    timestamp: Date.now(),
    description: 'Test transaction',
    ...overrides,
  };
}

describe('TransactionIndicator.vue', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  describe('rendering', () => {
    it('should render indicator button', () => {
      const wrapper = mount(TransactionIndicator);

      const button = wrapper.find('button');
      expect(button.exists()).toBe(true);
      expect(button.attributes('aria-label')).toBe('Transaction history');
    });

    it('should render transaction icon', () => {
      const wrapper = mount(TransactionIndicator);

      expect(wrapper.find('svg').exists()).toBe(true);
    });
  });

  describe('pending count badge', () => {
    it('should not show badge when no pending transactions', () => {
      const wrapper = mount(TransactionIndicator);

      const badge = wrapper.find('[class*="animate-pulse"]');
      expect(badge.exists()).toBe(false);
    });

    it('should show badge with count when pending transactions exist', () => {
      const store = useTransactionsStore();
      store.pendingTxs.push(createMockTransaction());

      const wrapper = mount(TransactionIndicator);

      const badge = wrapper.find('[class*="animate-pulse"]');
      expect(badge.exists()).toBe(true);
      expect(badge.text()).toBe('1');
    });

    it('should show correct count for multiple pending', () => {
      const store = useTransactionsStore();
      store.pendingTxs.push(createMockTransaction({ id: 'tx-1' }));
      store.pendingTxs.push(createMockTransaction({ id: 'tx-2' }));
      store.pendingTxs.push(createMockTransaction({ id: 'tx-3' }));

      const wrapper = mount(TransactionIndicator);

      const badge = wrapper.find('[class*="animate-pulse"]');
      expect(badge.text()).toBe('3');
    });

    it('should highlight button when pending transactions exist', () => {
      const store = useTransactionsStore();
      store.pendingTxs.push(createMockTransaction());

      const wrapper = mount(TransactionIndicator);

      const button = wrapper.find('button');
      expect(button.classes()).toContain('text-blue-600');
    });
  });

  describe('dropdown toggle', () => {
    it('should not show dropdown initially', () => {
      const wrapper = mount(TransactionIndicator);

      const dropdown = wrapper.find('[class*="shadow-lg"]');
      expect(dropdown.exists()).toBe(false);
    });

    it('should show dropdown when button clicked', async () => {
      const wrapper = mount(TransactionIndicator);

      await wrapper.find('button').trigger('click');

      const dropdown = wrapper.find('[class*="shadow-lg"]');
      expect(dropdown.exists()).toBe(true);
    });

    it('should hide dropdown when button clicked again', async () => {
      const wrapper = mount(TransactionIndicator);

      await wrapper.find('button').trigger('click');
      await wrapper.find('button').trigger('click');

      const dropdown = wrapper.find('[class*="shadow-lg"]');
      expect(dropdown.exists()).toBe(false);
    });
  });

  describe('empty state', () => {
    it('should show empty state when no transactions', async () => {
      const wrapper = mount(TransactionIndicator);

      await wrapper.find('button').trigger('click');

      expect(wrapper.text()).toContain('No transactions yet');
    });
  });

  describe('pending transactions section', () => {
    it('should show pending section header with count', async () => {
      const store = useTransactionsStore();
      store.pendingTxs.push(createMockTransaction());

      const wrapper = mount(TransactionIndicator);
      await wrapper.find('button').trigger('click');

      expect(wrapper.text()).toContain('Pending (1)');
    });

    it('should display pending transaction details', async () => {
      const store = useTransactionsStore();
      store.pendingTxs.push(createMockTransaction({
        type: TransactionType.Mint,
        description: 'Minting 100 tokens',
      }));

      const wrapper = mount(TransactionIndicator);
      await wrapper.find('button').trigger('click');

      expect(wrapper.text()).toContain('Mint');
      expect(wrapper.text()).toContain('Minting 100 tokens');
    });

    it('should show spinner for pending transactions', async () => {
      const store = useTransactionsStore();
      store.pendingTxs.push(createMockTransaction());

      const wrapper = mount(TransactionIndicator);
      await wrapper.find('button').trigger('click');

      expect(wrapper.html()).toContain('animate-spin');
    });
  });

  describe('recent transactions section', () => {
    it('should show recent section header', async () => {
      const store = useTransactionsStore();
      store.recentTxs.push(createMockTransaction({
        status: TransactionStatus.Confirmed,
      }));

      const wrapper = mount(TransactionIndicator);
      await wrapper.find('button').trigger('click');

      expect(wrapper.text()).toContain('Recent');
    });

    it('should display confirmed transaction with checkmark', async () => {
      const store = useTransactionsStore();
      store.recentTxs.push(createMockTransaction({
        status: TransactionStatus.Confirmed,
        description: 'Transfer complete',
      }));

      const wrapper = mount(TransactionIndicator);
      await wrapper.find('button').trigger('click');

      expect(wrapper.text()).toContain('Confirmed');
      expect(wrapper.text()).toContain('Transfer complete');
    });

    it('should display failed transaction with X icon', async () => {
      const store = useTransactionsStore();
      store.recentTxs.push(createMockTransaction({
        status: TransactionStatus.Failed,
        error: 'User rejected',
      }));

      const wrapper = mount(TransactionIndicator);
      await wrapper.find('button').trigger('click');

      expect(wrapper.text()).toContain('Failed');
      expect(wrapper.text()).toContain('User rejected');
    });

    it('should show explorer link for confirmed transaction with hash', async () => {
      const store = useTransactionsStore();
      store.recentTxs.push(createMockTransaction({
        status: TransactionStatus.Confirmed,
        hash: 'abc123hash',
      }));

      const wrapper = mount(TransactionIndicator);
      await wrapper.find('button').trigger('click');

      const link = wrapper.find('a');
      expect(link.exists()).toBe(true);
      expect(link.attributes('href')).toBe('https://explorer.galachain.com/tx/abc123hash');
      expect(link.attributes('target')).toBe('_blank');
    });

    it('should not show explorer link when no hash', async () => {
      const store = useTransactionsStore();
      store.recentTxs.push(createMockTransaction({
        status: TransactionStatus.Confirmed,
        hash: undefined,
      }));

      const wrapper = mount(TransactionIndicator);
      await wrapper.find('button').trigger('click');

      const link = wrapper.find('a');
      expect(link.exists()).toBe(false);
    });
  });

  describe('clear recent button', () => {
    it('should show clear button when recent transactions exist', async () => {
      const store = useTransactionsStore();
      store.recentTxs.push(createMockTransaction({
        status: TransactionStatus.Confirmed,
      }));

      const wrapper = mount(TransactionIndicator);
      await wrapper.find('button').trigger('click');

      expect(wrapper.text()).toContain('Clear recent transactions');
    });

    it('should not show clear button when no recent transactions', async () => {
      const wrapper = mount(TransactionIndicator);
      await wrapper.find('button').trigger('click');

      expect(wrapper.text()).not.toContain('Clear recent transactions');
    });

    it('should clear recent transactions when clicked', async () => {
      const store = useTransactionsStore();
      store.recentTxs.push(createMockTransaction({
        status: TransactionStatus.Confirmed,
      }));

      const wrapper = mount(TransactionIndicator);
      await wrapper.find('button').trigger('click');

      const clearButton = wrapper.findAll('button').find(b => b.text().includes('Clear'));
      expect(clearButton).toBeDefined();
      await clearButton!.trigger('click');

      expect(store.recentTxs.length).toBe(0);
    });
  });

  describe('time formatting', () => {
    it('should show "Just now" for recent timestamp', async () => {
      const store = useTransactionsStore();
      store.recentTxs.push(createMockTransaction({
        status: TransactionStatus.Confirmed,
        timestamp: Date.now() - 30000, // 30 seconds ago
      }));

      const wrapper = mount(TransactionIndicator);
      await wrapper.find('button').trigger('click');

      expect(wrapper.text()).toContain('Just now');
    });

    it('should show minutes for older timestamp', async () => {
      const store = useTransactionsStore();
      store.recentTxs.push(createMockTransaction({
        status: TransactionStatus.Confirmed,
        timestamp: Date.now() - 300000, // 5 minutes ago
      }));

      const wrapper = mount(TransactionIndicator);
      await wrapper.find('button').trigger('click');

      expect(wrapper.text()).toContain('5m ago');
    });

    it('should show hours for much older timestamp', async () => {
      const store = useTransactionsStore();
      store.recentTxs.push(createMockTransaction({
        status: TransactionStatus.Confirmed,
        timestamp: Date.now() - 7200000, // 2 hours ago
      }));

      const wrapper = mount(TransactionIndicator);
      await wrapper.find('button').trigger('click');

      expect(wrapper.text()).toContain('2h ago');
    });
  });

  describe('transaction type labels', () => {
    it.each([
      [TransactionType.Transfer, 'Transfer'],
      [TransactionType.Mint, 'Mint'],
      [TransactionType.Burn, 'Burn'],
      [TransactionType.CreateCollection, 'Create Collection'],
      [TransactionType.CreateClass, 'Create Class'],
    ])('should show correct label for %s', async (type, label) => {
      const store = useTransactionsStore();
      store.pendingTxs.push(createMockTransaction({ type }));

      const wrapper = mount(TransactionIndicator);
      await wrapper.find('button').trigger('click');

      expect(wrapper.text()).toContain(label);
    });
  });
});
