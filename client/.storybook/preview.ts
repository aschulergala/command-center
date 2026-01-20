import type { Preview } from '@storybook/vue3-vite'
import { createPinia } from 'pinia'
import '../src/style.css'

// Create Pinia instance for all stories
const pinia = createPinia()

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: 'dark',
      values: [
        { name: 'dark', value: '#0f0f0f' },
        { name: 'light', value: '#ffffff' },
      ],
    },
  },
  decorators: [
    (story) => ({
      components: { story },
      setup() {
        return { pinia }
      },
      template: '<Suspense><story /></Suspense>',
    }),
  ],
}

export default preview