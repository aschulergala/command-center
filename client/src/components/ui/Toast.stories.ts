import type { Meta, StoryObj } from '@storybook/vue3-vite'
import Toast from './Toast.vue'
import type { Toast as ToastType } from '@/stores/toasts'

const meta: Meta<typeof Toast> = {
  title: 'UI/Toast',
  component: Toast,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof Toast>

const createToast = (
  type: ToastType['type'],
  title: string,
  message: string,
  options: Partial<ToastType> = {},
): ToastType => ({
  id: `toast-${Date.now()}`,
  type,
  title,
  message,
  duration: type === 'error' || type === 'pending' ? 0 : 5000,
  dismissible: type !== 'pending',
  createdAt: Date.now(),
  ...options,
})

export const Success: Story = {
  args: {
    toast: createToast('success', 'Transaction Successful', 'Your tokens have been transferred successfully.'),
  },
}

export const Error: Story = {
  args: {
    toast: createToast('error', 'Transaction Failed', 'Insufficient balance to complete this transaction.'),
  },
}

export const Pending: Story = {
  args: {
    toast: createToast('pending', 'Processing Transaction', 'Please wait while we process your request...'),
  },
}

export const Info: Story = {
  args: {
    toast: createToast('info', 'Wallet Connected', 'Your wallet is now connected to GalaChain.'),
  },
}

export const AllTypes: Story = {
  render: () => ({
    components: { Toast },
    setup() {
      const toasts = [
        createToast('success', 'Success', 'Operation completed successfully.', { id: 'success', duration: 0 }),
        createToast('error', 'Error', 'Something went wrong. Please try again.', { id: 'error' }),
        createToast('pending', 'Pending', 'Processing your request...', { id: 'pending' }),
        createToast('info', 'Info', 'Here\'s some helpful information.', { id: 'info', duration: 0 }),
      ]
      return { toasts }
    },
    template: `
      <div class="space-y-4 w-[360px]">
        <Toast v-for="toast in toasts" :key="toast.id" :toast="toast" />
      </div>
    `,
  }),
}
