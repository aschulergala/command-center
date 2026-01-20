import type { Meta, StoryObj } from '@storybook/vue3'
import ExportComingSoon from './ExportComingSoon.vue'

const meta: Meta<typeof ExportComingSoon> = {
  title: 'Components/Export/ExportComingSoon',
  component: ExportComingSoon,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'A "Coming Soon" placeholder for the Export feature, showing a preview mockup of planned functionality including date range filters, token type selection, and CSV download.',
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof ExportComingSoon>

export const Default: Story = {
  render: () => ({
    components: { ExportComingSoon },
    template: `
      <div class="max-w-4xl mx-auto">
        <ExportComingSoon />
      </div>
    `,
  }),
}

export const Mobile: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
  render: () => ({
    components: { ExportComingSoon },
    template: `
      <div class="p-4">
        <ExportComingSoon />
      </div>
    `,
  }),
}

export const Tablet: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'tablet',
    },
  },
  render: () => ({
    components: { ExportComingSoon },
    template: `
      <div class="p-6 max-w-2xl mx-auto">
        <ExportComingSoon />
      </div>
    `,
  }),
}
