import type { Meta, StoryObj } from '@storybook/vue3-vite'
import TokenCard from './TokenCard.vue'
import type { FungibleTokenDisplay } from '@shared/types/display'

const meta: Meta<typeof TokenCard> = {
  title: 'Tokens/TokenCard',
  component: TokenCard,
  tags: ['autodocs'],
  argTypes: {
    token: {
      description: 'Token display data',
    },
  },
}

export default meta
type Story = StoryObj<typeof TokenCard>

const baseToken: FungibleTokenDisplay = {
  tokenKey: 'GALA|Currency|GALA|',
  collection: 'GALA',
  category: 'Currency',
  type: 'GALA',
  additionalKey: '',
  name: 'GALA Token',
  symbol: 'GALA',
  description: 'The native token of GalaChain',
  image: '',
  decimals: 8,
  balanceRaw: '1500000000000',
  balanceFormatted: '15,000.00',
  lockedBalanceRaw: '0',
  lockedBalanceFormatted: '0.00',
  spendableBalanceRaw: '1500000000000',
  spendableBalanceFormatted: '15,000.00',
  canMint: false,
  canBurn: false,
}

export const Default: Story = {
  args: {
    token: baseToken,
  },
}

export const WithImage: Story = {
  args: {
    token: {
      ...baseToken,
      image: 'https://cdn.gala.games/images/gala-token.png',
    },
  },
}

export const WithLockedBalance: Story = {
  args: {
    token: {
      ...baseToken,
      lockedBalanceRaw: '500000000000',
      lockedBalanceFormatted: '5,000.00',
      spendableBalanceRaw: '1000000000000',
      spendableBalanceFormatted: '10,000.00',
    },
  },
}

export const WithMintAuthority: Story = {
  args: {
    token: {
      ...baseToken,
      canMint: true,
      mintAllowanceRaw: '100000000000000',
      mintAllowanceFormatted: '1,000,000.00',
    },
  },
}

export const WithBurnAuthority: Story = {
  args: {
    token: {
      ...baseToken,
      canBurn: true,
    },
  },
}

export const WithAllAuthorities: Story = {
  args: {
    token: {
      ...baseToken,
      canMint: true,
      canBurn: true,
      mintAllowanceRaw: '500000000000',
      mintAllowanceFormatted: '5,000.00',
    },
  },
}

export const ZeroBalance: Story = {
  args: {
    token: {
      ...baseToken,
      balanceRaw: '0',
      balanceFormatted: '0.00',
      spendableBalanceRaw: '0',
      spendableBalanceFormatted: '0.00',
    },
  },
}

export const SmallBalance: Story = {
  args: {
    token: {
      ...baseToken,
      name: 'SILK',
      symbol: 'SILK',
      collection: 'SILK',
      balanceRaw: '12345678',
      balanceFormatted: '0.12345678',
      spendableBalanceRaw: '12345678',
      spendableBalanceFormatted: '0.12345678',
    },
  },
}
