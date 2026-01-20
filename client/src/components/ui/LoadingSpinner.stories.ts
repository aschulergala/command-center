import type { Meta, StoryObj } from '@storybook/vue3-vite'
import LoadingSpinner from './LoadingSpinner.vue'

const meta: Meta<typeof LoadingSpinner> = {
  title: 'UI/LoadingSpinner',
  component: LoadingSpinner,
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Size of the spinner',
    },
  },
}

export default meta
type Story = StoryObj<typeof LoadingSpinner>

export const Small: Story = {
  args: {
    size: 'sm',
  },
}

export const Medium: Story = {
  args: {
    size: 'md',
  },
}

export const Large: Story = {
  args: {
    size: 'lg',
  },
}

export const AllSizes: Story = {
  render: () => ({
    components: { LoadingSpinner },
    template: `
      <div class="flex items-center gap-8">
        <div class="text-center">
          <LoadingSpinner size="sm" />
          <p class="text-gray-400 text-xs mt-2">Small</p>
        </div>
        <div class="text-center">
          <LoadingSpinner size="md" />
          <p class="text-gray-400 text-xs mt-2">Medium</p>
        </div>
        <div class="text-center">
          <LoadingSpinner size="lg" />
          <p class="text-gray-400 text-xs mt-2">Large</p>
        </div>
      </div>
    `,
  }),
}
