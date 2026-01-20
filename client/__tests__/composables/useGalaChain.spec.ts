import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useGalaChain } from '@/composables/useGalaChain'
import { useWalletStore } from '@/stores/wallet'
import { GalaChainError } from '@/lib/galachainErrors'

// Mock the galachainClient module
vi.mock('@/lib/galachainClient', () => ({
  fetchBalances: vi.fn(),
  fetchAllowances: vi.fn(),
  transfer: vi.fn(),
  mint: vi.fn(),
  burn: vi.fn(),
  getGalaChainConfig: vi.fn(() => ({
    env: 'stage',
    gatewayUrl: 'https://gateway-stage.galachain.com',
    apiUrl: 'https://api-stage.galachain.com',
  })),
}))

// Import the mocked functions
import * as galachainClient from '@/lib/galachainClient'

// Mock BrowserConnectClient
const mockClient = {
  evaluate: vi.fn(),
  submit: vi.fn(),
  connect: vi.fn(),
  disconnect: vi.fn(),
  on: vi.fn().mockReturnThis(),
  off: vi.fn().mockReturnThis(),
  getPublicKey: vi.fn().mockResolvedValue({ publicKey: 'mock-public-key' }),
}

// Mock @gala-chain/connect
vi.mock('@gala-chain/connect', () => ({
  BrowserConnectClient: vi.fn(() => mockClient),
}))

describe('useGalaChain', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const { isLoading, error, isConnected, walletAddress, config } =
        useGalaChain()

      expect(isLoading.value).toBe(false)
      expect(error.value).toBeNull()
      expect(isConnected.value).toBe(false)
      expect(walletAddress.value).toBeNull()
      expect(config.value).toEqual({
        env: 'stage',
        gatewayUrl: 'https://gateway-stage.galachain.com',
        apiUrl: 'https://api-stage.galachain.com',
      })
    })
  })

  describe('isConnected computed', () => {
    it('should reflect wallet store connected state', async () => {
      const walletStore = useWalletStore()
      const { isConnected } = useGalaChain()

      expect(isConnected.value).toBe(false)

      // Simulate connected wallet
      walletStore.$patch({
        connected: true,
        address: 'eth|0x123',
      })

      expect(isConnected.value).toBe(true)
    })
  })

  describe('clearError', () => {
    it('should clear the error state', () => {
      const { error, clearError } = useGalaChain()

      // Manually set error for testing
      error.value = 'Some error'
      expect(error.value).toBe('Some error')

      clearError()
      expect(error.value).toBeNull()
    })
  })

  describe('getBalances', () => {
    it('should return error when wallet not connected', async () => {
      const { getBalances } = useGalaChain()

      const result = await getBalances()

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toContain('not connected')
      }
    })

    it('should fetch balances when wallet connected', async () => {
      const walletStore = useWalletStore()
      // Simulate connected wallet with client
      walletStore.$patch({
        connected: true,
        address: 'eth|0x123',
      })
      // Mock getClient to return our mock client
      vi.spyOn(walletStore, 'getClient').mockReturnValue(mockClient as any)

      const mockBalances = [{ collection: 'GALA', quantity: '100' }]
      vi.mocked(galachainClient.fetchBalances).mockResolvedValue(
        mockBalances as any
      )

      const { getBalances, isLoading } = useGalaChain()

      const resultPromise = getBalances()
      expect(isLoading.value).toBe(true)

      const result = await resultPromise
      expect(isLoading.value).toBe(false)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toEqual(mockBalances)
      }
    })

    it('should use provided owner address', async () => {
      const walletStore = useWalletStore()
      walletStore.$patch({
        connected: true,
        address: 'eth|0x123',
      })
      vi.spyOn(walletStore, 'getClient').mockReturnValue(mockClient as any)
      vi.mocked(galachainClient.fetchBalances).mockResolvedValue([])

      const { getBalances } = useGalaChain()

      await getBalances('eth|0xOther')

      expect(galachainClient.fetchBalances).toHaveBeenCalledWith(
        mockClient,
        'eth|0xOther',
        undefined
      )
    })

    it('should handle errors gracefully', async () => {
      const walletStore = useWalletStore()
      walletStore.$patch({
        connected: true,
        address: 'eth|0x123',
      })
      vi.spyOn(walletStore, 'getClient').mockReturnValue(mockClient as any)

      vi.mocked(galachainClient.fetchBalances).mockRejectedValue(
        new GalaChainError('Fetch failed', 'FETCH_ERROR')
      )

      const { getBalances, error } = useGalaChain()

      const result = await getBalances()

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toBe('Fetch failed')
      }
      expect(error.value).toBe('Fetch failed')
    })
  })

  describe('getAllowances', () => {
    it('should fetch allowances when wallet connected', async () => {
      const walletStore = useWalletStore()
      walletStore.$patch({
        connected: true,
        address: 'eth|0x123',
      })
      vi.spyOn(walletStore, 'getClient').mockReturnValue(mockClient as any)

      const mockAllowances = [{ grantedBy: 'eth|0xOwner', quantity: '50' }]
      vi.mocked(galachainClient.fetchAllowances).mockResolvedValue(
        mockAllowances as any
      )

      const { getAllowances } = useGalaChain()

      const result = await getAllowances()

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toEqual(mockAllowances)
      }
    })
  })

  describe('transferToken', () => {
    it('should return error when wallet not connected', async () => {
      const { transferToken } = useGalaChain()

      const result = await transferToken(
        'eth|0xTo',
        {
          collection: 'GALA',
          category: 'Unit',
          type: 'none',
          additionalKey: 'none',
          instance: 0,
        },
        '100'
      )

      expect(result.success).toBe(false)
    })

    it('should transfer tokens when wallet connected', async () => {
      const walletStore = useWalletStore()
      walletStore.$patch({
        connected: true,
        address: 'eth|0x123',
      })
      vi.spyOn(walletStore, 'getClient').mockReturnValue(mockClient as any)

      vi.mocked(galachainClient.transfer).mockResolvedValue([])

      const { transferToken } = useGalaChain()

      const tokenInstance = {
        collection: 'GALA',
        category: 'Unit',
        type: 'none',
        additionalKey: 'none',
        instance: 0,
      }

      const result = await transferToken('eth|0xTo', tokenInstance, '100')

      expect(result.success).toBe(true)
      expect(galachainClient.transfer).toHaveBeenCalledWith(
        mockClient,
        'eth|0x123',
        'eth|0xTo',
        tokenInstance,
        '100'
      )
    })

    it('should handle transfer rejection', async () => {
      const walletStore = useWalletStore()
      walletStore.$patch({
        connected: true,
        address: 'eth|0x123',
      })
      vi.spyOn(walletStore, 'getClient').mockReturnValue(mockClient as any)

      vi.mocked(galachainClient.transfer).mockRejectedValue(
        new GalaChainError(
          'Transaction was rejected. Please approve the transaction in your wallet to continue.',
          'USER_REJECTED'
        )
      )

      const { transferToken, error } = useGalaChain()

      const result = await transferToken(
        'eth|0xTo',
        {
          collection: 'GALA',
          category: 'Unit',
          type: 'none',
          additionalKey: 'none',
          instance: 0,
        },
        '100'
      )

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toContain('rejected')
      }
      expect(error.value).toContain('rejected')
    })
  })

  describe('mintToken', () => {
    it('should mint tokens when wallet connected', async () => {
      const walletStore = useWalletStore()
      walletStore.$patch({
        connected: true,
        address: 'eth|0x123',
      })
      vi.spyOn(walletStore, 'getClient').mockReturnValue(mockClient as any)

      vi.mocked(galachainClient.mint).mockResolvedValue([])

      const { mintToken } = useGalaChain()

      const tokenClass = {
        collection: 'MyToken',
        category: 'Unit',
        type: 'none',
        additionalKey: 'none',
      }

      const result = await mintToken(tokenClass, '1000')

      expect(result.success).toBe(true)
      expect(galachainClient.mint).toHaveBeenCalledWith(
        mockClient,
        tokenClass,
        'eth|0x123', // defaults to connected wallet
        '1000'
      )
    })

    it('should mint to specified owner', async () => {
      const walletStore = useWalletStore()
      walletStore.$patch({
        connected: true,
        address: 'eth|0x123',
      })
      vi.spyOn(walletStore, 'getClient').mockReturnValue(mockClient as any)

      vi.mocked(galachainClient.mint).mockResolvedValue([])

      const { mintToken } = useGalaChain()

      const tokenClass = {
        collection: 'MyToken',
        category: 'Unit',
        type: 'none',
        additionalKey: 'none',
      }

      await mintToken(tokenClass, '1000', 'eth|0xOther')

      expect(galachainClient.mint).toHaveBeenCalledWith(
        mockClient,
        tokenClass,
        'eth|0xOther',
        '1000'
      )
    })
  })

  describe('burnTokens', () => {
    it('should burn tokens when wallet connected', async () => {
      const walletStore = useWalletStore()
      walletStore.$patch({
        connected: true,
        address: 'eth|0x123',
      })
      vi.spyOn(walletStore, 'getClient').mockReturnValue(mockClient as any)

      vi.mocked(galachainClient.burn).mockResolvedValue([])

      const { burnTokens } = useGalaChain()

      const tokenInstances = [
        {
          tokenInstanceKey: {
            collection: 'GALA',
            category: 'Unit',
            type: 'none',
            additionalKey: 'none',
            instance: 0,
          },
          quantity: '50',
        },
      ]

      const result = await burnTokens(tokenInstances)

      expect(result.success).toBe(true)
      expect(galachainClient.burn).toHaveBeenCalledWith(
        mockClient,
        tokenInstances
      )
    })
  })
})
