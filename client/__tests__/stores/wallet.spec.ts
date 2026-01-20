import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useWalletStore } from '@/stores/wallet'

// Mock @gala-chain/connect
const mockConnect = vi.fn()
const mockDisconnect = vi.fn()
const mockGetPublicKey = vi.fn()
const mockOn = vi.fn()
const mockOff = vi.fn()

// Create a mock class that can be instantiated
vi.mock('@gala-chain/connect', () => {
  return {
    BrowserConnectClient: class MockBrowserConnectClient {
      connect = mockConnect
      disconnect = mockDisconnect
      getPublicKey = mockGetPublicKey
      on = mockOn.mockReturnThis()
      off = mockOff.mockReturnThis()
    }
  }
})

// Mock @vueuse/core useStorage
vi.mock('@vueuse/core', () => ({
  useStorage: vi.fn((key: string, defaultValue: boolean) => {
    return { value: defaultValue }
  }),
}))

describe('wallet store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
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

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const store = useWalletStore()
      expect(store.connected).toBe(false)
      expect(store.address).toBe(null)
      expect(store.publicKey).toBe(null)
      expect(store.isConnecting).toBe(false)
      expect(store.error).toBe(null)
    })

    it('should return disconnected status initially', () => {
      const store = useWalletStore()
      expect(store.status).toBe('disconnected')
    })

    it('should return empty truncatedAddress initially', () => {
      const store = useWalletStore()
      expect(store.truncatedAddress).toBe('')
    })
  })

  describe('connect action', () => {
    it('should set isConnecting to true during connection', async () => {
      const store = useWalletStore()

      // Make connect return a promise that we control
      let resolveConnect: (value: string) => void
      mockConnect.mockImplementation(() => new Promise((resolve) => {
        resolveConnect = resolve
      }))
      mockGetPublicKey.mockResolvedValue({ publicKey: 'testPubKey' })

      const connectPromise = store.connect()
      expect(store.isConnecting).toBe(true)
      expect(store.status).toBe('connecting')

      // Resolve the connection
      resolveConnect!('eth|0x1234567890abcdef1234567890abcdef12345678')
      await connectPromise

      expect(store.isConnecting).toBe(false)
    })

    it('should set connected state after successful connection', async () => {
      const store = useWalletStore()

      mockConnect.mockResolvedValue('eth|0x1234567890abcdef1234567890abcdef12345678')
      mockGetPublicKey.mockResolvedValue({ publicKey: 'testPublicKey123' })

      await store.connect()

      expect(store.connected).toBe(true)
      expect(store.address).toBe('eth|0x1234567890abcdef1234567890abcdef12345678')
      expect(store.publicKey).toBe('testPublicKey123')
      expect(store.error).toBe(null)
      expect(store.status).toBe('connected')
    })

    it('should set error on connection failure', async () => {
      const store = useWalletStore()

      mockConnect.mockRejectedValue(new Error('User rejected the connection request'))

      await store.connect()

      expect(store.connected).toBe(false)
      expect(store.error).toContain('rejected')
      expect(store.isConnecting).toBe(false)
    })

    it('should set error when MetaMask is not installed', async () => {
      const store = useWalletStore()

      // Remove window.ethereum
      Object.defineProperty(window, 'ethereum', {
        value: undefined,
        writable: true,
        configurable: true,
      })

      await store.connect()

      expect(store.connected).toBe(false)
      expect(store.error).toContain('MetaMask is not installed')
    })

    it('should handle user denial error', async () => {
      const store = useWalletStore()

      mockConnect.mockRejectedValue(new Error('User denied account access'))

      await store.connect()

      expect(store.error).toContain('rejected')
    })
  })

  describe('disconnect action', () => {
    it('should clear all state on disconnect', async () => {
      const store = useWalletStore()

      // First connect
      mockConnect.mockResolvedValue('eth|0x1234567890abcdef1234567890abcdef12345678')
      mockGetPublicKey.mockResolvedValue({ publicKey: 'testPubKey' })
      await store.connect()

      expect(store.connected).toBe(true)

      // Then disconnect
      store.disconnect()

      expect(store.connected).toBe(false)
      expect(store.address).toBe(null)
      expect(store.publicKey).toBe(null)
      expect(store.error).toBe(null)
      expect(store.status).toBe('disconnected')
    })

    it('should call client disconnect method', async () => {
      const store = useWalletStore()

      mockConnect.mockResolvedValue('eth|0x1234')
      mockGetPublicKey.mockResolvedValue({ publicKey: 'test' })
      await store.connect()

      store.disconnect()

      expect(mockDisconnect).toHaveBeenCalled()
      expect(mockOff).toHaveBeenCalled()
    })
  })

  describe('truncatedAddress getter', () => {
    it('should truncate long addresses correctly', async () => {
      const store = useWalletStore()

      mockConnect.mockResolvedValue('eth|0x1234567890abcdef1234567890abcdef12345678')
      mockGetPublicKey.mockResolvedValue({ publicKey: 'test' })
      await store.connect()

      expect(store.truncatedAddress).toBe('eth|0x12...5678')
    })

    it('should not truncate short addresses', async () => {
      const store = useWalletStore()

      mockConnect.mockResolvedValue('eth|0x1234')
      mockGetPublicKey.mockResolvedValue({ publicKey: 'test' })
      await store.connect()

      expect(store.truncatedAddress).toBe('eth|0x1234')
    })
  })

  describe('clearError action', () => {
    it('should clear error state', async () => {
      const store = useWalletStore()

      mockConnect.mockRejectedValue(new Error('Test error'))
      await store.connect()

      expect(store.error).not.toBe(null)

      store.clearError()

      expect(store.error).toBe(null)
    })
  })

  describe('state getter', () => {
    it('should return complete wallet state object', () => {
      const store = useWalletStore()

      const state = store.state
      expect(state).toEqual({
        connected: false,
        address: null,
        publicKey: null,
        isConnecting: false,
        error: null,
      })
    })
  })
})
