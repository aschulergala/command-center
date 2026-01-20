import type { Meta, StoryObj } from '@storybook/vue3-vite'
import ErrorDisplay from './ErrorDisplay.vue'
import { ErrorSeverity, ErrorCode } from '@shared/errors'

const meta: Meta<typeof ErrorDisplay> = {
  title: 'UI/ErrorDisplay',
  component: ErrorDisplay,
  tags: ['autodocs'],
  argTypes: {
    message: {
      control: 'text',
      description: 'Error message to display',
    },
    severity: {
      control: 'select',
      options: ['info', 'warning', 'error', 'critical'],
      description: 'Severity level',
    },
    action: {
      control: 'text',
      description: 'Action text or button',
    },
    code: {
      control: 'text',
      description: 'Error code (for dev mode)',
    },
    compact: {
      control: 'boolean',
      description: 'Compact display mode',
    },
    dismissible: {
      control: 'boolean',
      description: 'Whether error can be dismissed',
    },
  },
}

export default meta
type Story = StoryObj<typeof ErrorDisplay>

export const Info: Story = {
  args: {
    message: 'This is an informational message about the current state.',
    severity: ErrorSeverity.Info,
  },
}

export const Warning: Story = {
  args: {
    message: 'Please verify your input before continuing.',
    severity: ErrorSeverity.Warning,
  },
}

export const Error: Story = {
  args: {
    message: 'Transaction failed. Please check your balance and try again.',
    severity: ErrorSeverity.Error,
    action: 'Retry',
  },
}

export const Critical: Story = {
  args: {
    message: 'Connection lost. Unable to communicate with the blockchain.',
    severity: ErrorSeverity.Critical,
    action: 'Reconnect',
  },
}

export const WithCode: Story = {
  args: {
    message: 'Insufficient balance for this transaction.',
    severity: ErrorSeverity.Error,
    code: ErrorCode.INSUFFICIENT_BALANCE,
    showCode: true,
  },
}

export const Compact: Story = {
  args: {
    message: 'Invalid amount entered.',
    severity: ErrorSeverity.Warning,
    compact: true,
  },
}

export const Dismissible: Story = {
  args: {
    message: 'This error can be dismissed.',
    severity: ErrorSeverity.Error,
    dismissible: true,
  },
}

export const AllSeverities: Story = {
  render: () => ({
    components: { ErrorDisplay },
    setup() {
      return { ErrorSeverity }
    },
    template: `
      <div class="space-y-4">
        <ErrorDisplay
          message="This is an informational message."
          :severity="ErrorSeverity.Info"
        />
        <ErrorDisplay
          message="This is a warning message."
          :severity="ErrorSeverity.Warning"
        />
        <ErrorDisplay
          message="This is an error message."
          :severity="ErrorSeverity.Error"
        />
        <ErrorDisplay
          message="This is a critical error message."
          :severity="ErrorSeverity.Critical"
        />
      </div>
    `,
  }),
}
