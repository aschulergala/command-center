import type { Meta, StoryObj } from '@storybook/vue3-vite'
import EmptyState from './EmptyState.vue'

const meta: Meta<typeof EmptyState> = {
  title: 'UI/EmptyState',
  component: EmptyState,
  tags: ['autodocs'],
  argTypes: {
    icon: {
      control: 'select',
      options: ['tokens', 'nfts', 'collections', 'search', 'error'],
      description: 'Icon to display',
    },
    title: {
      control: 'text',
      description: 'Main title text',
    },
    description: {
      control: 'text',
      description: 'Descriptive message',
    },
    actionLabel: {
      control: 'text',
      description: 'Action button text',
    },
  },
}

export default meta
type Story = StoryObj<typeof EmptyState>

export const Tokens: Story = {
  args: {
    icon: 'tokens',
    title: 'No tokens found',
    description: 'You don\'t have any tokens yet. Start by receiving or minting some tokens.',
  },
}

export const NFTs: Story = {
  args: {
    icon: 'nfts',
    title: 'No NFTs found',
    description: 'Your NFT collection is empty. Explore the marketplace to find your first NFT.',
  },
}

export const Collections: Story = {
  args: {
    icon: 'collections',
    title: 'No collections',
    description: 'You haven\'t created any collections yet.',
    actionLabel: 'Create Collection',
  },
}

export const Search: Story = {
  args: {
    icon: 'search',
    title: 'No results',
    description: 'No items match your search criteria. Try a different filter.',
  },
}

export const Error: Story = {
  args: {
    icon: 'error',
    title: 'Something went wrong',
    description: 'We couldn\'t load your data. Please try again.',
    actionLabel: 'Retry',
  },
}
