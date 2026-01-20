import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createTestingPinia } from '@pinia/testing'
import WalletConnect from '@/components/WalletConnect.vue'

// Mock @gala-chain/connect
vi.mock('@gala-chain/connect', () => ({
  BrowserConnectClient: vi.fn().mockImplementation(() => ({
    connect: vi.fn(),
    disconnect: vi.fn(),
    getPublicKey: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
  })),
}))

// Mock @vueuse/core useStorage
vi.mock('@vueuse/core', () => ({
  useStorage: vi.fn((key: string, defaultValue: boolean) => {
    return { value: defaultValue }
  }),
}))

describe('WalletConnect component', () => {
  beforeEach(() => {
    // Reset window.ethereum mock
    Object.defineProperty(window, 'ethereum', {
      value: {
        request: vi.fn(),
        on: vi.fn(),
        removeListener: vi.fn(),
      },
      writable: true,
      configurable: true,
    })
  })

  describe('disconnected state', () => {
    it('should show "Connect Wallet" button when disconnected', () => {
      const wrapper = mount(WalletConnect, {
        global: {
          plugins: [
            createTestingPinia({
              initialState: {
                wallet: {
                  connected: false,
                  address: null,
                  publicKey: null,
                  isConnecting: false,
                  error: null,
                },
              },
            }),
          ],
        },
      })

      expect(wrapper.text()).toContain('Connect Wallet')
    })

    it('should show "Connecting..." when isConnecting is true', () => {
      const wrapper = mount(WalletConnect, {
        global: {
          plugins: [
            createTestingPinia({
              initialState: {
                wallet: {
                  connected: false,
                  address: null,
                  publicKey: null,
                  isConnecting: true,
                  error: null,
                },
              },
            }),
          ],
        },
      })

      expect(wrapper.text()).toContain('Connecting...')
    })

    it('should disable button when connecting', () => {
      const wrapper = mount(WalletConnect, {
        global: {
          plugins: [
            createTestingPinia({
              initialState: {
                wallet: {
                  connected: false,
                  address: null,
                  publicKey: null,
                  isConnecting: true,
                  error: null,
                },
              },
            }),
          ],
        },
      })

      const button = wrapper.find('button')
      expect(button.attributes('disabled')).toBeDefined()
    })
  })

  describe('connected state', () => {
    it('should show truncated address when connected', () => {
      const wrapper = mount(WalletConnect, {
        global: {
          plugins: [
            createTestingPinia({
              initialState: {
                wallet: {
                  connected: true,
                  address: 'eth|0x1234567890abcdef1234567890abcdef12345678',
                  publicKey: 'testPubKey',
                  isConnecting: false,
                  error: null,
                },
              },
            }),
          ],
        },
      })

      // The truncatedAddress getter should show the truncated form
      expect(wrapper.text()).toContain('eth|0x12')
      expect(wrapper.text()).toContain('5678')
    })

    it('should show green indicator when connected', () => {
      const wrapper = mount(WalletConnect, {
        global: {
          plugins: [
            createTestingPinia({
              initialState: {
                wallet: {
                  connected: true,
                  address: 'eth|0x1234',
                  publicKey: 'testPubKey',
                  isConnecting: false,
                  error: null,
                },
              },
            }),
          ],
        },
      })

      const indicator = wrapper.find('.bg-green-500')
      expect(indicator.exists()).toBe(true)
    })

    it('should toggle dropdown on click when connected', async () => {
      const wrapper = mount(WalletConnect, {
        global: {
          plugins: [
            createTestingPinia({
              initialState: {
                wallet: {
                  connected: true,
                  address: 'eth|0x1234',
                  publicKey: 'testPubKey',
                  isConnecting: false,
                  error: null,
                },
              },
            }),
          ],
        },
      })

      // Dropdown should not be visible initially
      expect(wrapper.find('.absolute.right-0.mt-2.w-48').exists()).toBe(false)

      // Click the button to show dropdown
      await wrapper.find('button').trigger('click')

      // Dropdown should now be visible
      expect(wrapper.find('.absolute.right-0.mt-2.w-48').exists()).toBe(true)
    })

    it('should show disconnect option in dropdown', async () => {
      const wrapper = mount(WalletConnect, {
        global: {
          plugins: [
            createTestingPinia({
              initialState: {
                wallet: {
                  connected: true,
                  address: 'eth|0x1234',
                  publicKey: 'testPubKey',
                  isConnecting: false,
                  error: null,
                },
              },
            }),
          ],
        },
      })

      // Open dropdown
      await wrapper.find('button').trigger('click')

      expect(wrapper.text()).toContain('Disconnect')
    })
  })

  describe('error state', () => {
    it('should display error message when there is an error', () => {
      const wrapper = mount(WalletConnect, {
        global: {
          plugins: [
            createTestingPinia({
              initialState: {
                wallet: {
                  connected: false,
                  address: null,
                  publicKey: null,
                  isConnecting: false,
                  error: 'Connection failed. Please try again.',
                },
              },
            }),
          ],
        },
      })

      expect(wrapper.text()).toContain('Connection failed')
    })

    it('should show dismiss button for error', () => {
      const wrapper = mount(WalletConnect, {
        global: {
          plugins: [
            createTestingPinia({
              initialState: {
                wallet: {
                  connected: false,
                  address: null,
                  publicKey: null,
                  isConnecting: false,
                  error: 'Test error message',
                },
              },
            }),
          ],
        },
      })

      expect(wrapper.text()).toContain('Dismiss')
    })

    it('should not show error when connected', () => {
      const wrapper = mount(WalletConnect, {
        global: {
          plugins: [
            createTestingPinia({
              initialState: {
                wallet: {
                  connected: true,
                  address: 'eth|0x1234',
                  publicKey: 'testPubKey',
                  isConnecting: false,
                  error: 'Some old error',
                },
              },
            }),
          ],
        },
      })

      // Error should not be visible when connected
      const errorDiv = wrapper.find('.bg-red-50')
      expect(errorDiv.exists()).toBe(false)
    })
  })
})
