import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { GalaChainError } from '@/lib/galachainErrors'

// Mock the config module
vi.mock('@/lib/config', () => ({
  config: {
    galachain: {
      env: 'stage',
      gatewayUrl: 'https://gateway-stage.galachain.com',
      apiUrl: 'https://api-stage.galachain.com',
    },
  },
}))

// Mock TokenApi
const mockFetchBalances = vi.fn()
const mockFetchAllowances = vi.fn()
const mockTransferToken = vi.fn()
const mockMintToken = vi.fn()
const mockBurnTokens = vi.fn()

vi.mock('@gala-chain/connect', () => ({
  BrowserConnectClient: vi.fn(),
  TokenApi: vi.fn().mockImplementation(() => ({
    FetchBalances: mockFetchBalances,
    FetchAllowances: mockFetchAllowances,
    TransferToken: mockTransferToken,
    MintToken: mockMintToken,
    BurnTokens: mockBurnTokens,
  })),
  GalaChainResponseError: class GalaChainResponseError extends Error {
    Error: string
    Message: string
    ErrorCode: number
    constructor(data: { error: string; message: string; statusCode?: number }) {
      super(data.message)
      this.Error = data.error
      this.Message = data.message
      this.ErrorCode = data.statusCode || 500
    }
  },
}))

// Valid test addresses
const TEST_ADDRESS_1 = 'client|testAddress1234567890abcdef'
const TEST_ADDRESS_2 = 'client|testAddress2234567890abcdef'

describe('galachainClient', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('fetchBalances', () => {
    it('should call TokenApi.FetchBalances with correct parameters', async () => {
      const { fetchBalances } = await import('@/lib/galachainClient')

      mockFetchBalances.mockResolvedValue({
        Data: [{ collection: 'GALA', quantity: '100' }],
      })

      const result = await fetchBalances({} as any, TEST_ADDRESS_1)

      expect(mockFetchBalances).toHaveBeenCalledWith(
        expect.objectContaining({
          owner: TEST_ADDRESS_1,
        })
      )
      expect(result).toEqual([{ collection: 'GALA', quantity: '100' }])
    })

    it('should pass filters to FetchBalances', async () => {
      const { fetchBalances } = await import('@/lib/galachainClient')

      mockFetchBalances.mockResolvedValue({
        Data: [],
      })

      await fetchBalances({} as any, TEST_ADDRESS_1, {
        collection: 'GALA',
        category: 'Unit',
      })

      expect(mockFetchBalances).toHaveBeenCalledWith(
        expect.objectContaining({
          owner: TEST_ADDRESS_1,
          collection: 'GALA',
          category: 'Unit',
        })
      )
    })

    it('should handle empty balance list', async () => {
      const { fetchBalances } = await import('@/lib/galachainClient')

      mockFetchBalances.mockResolvedValue({
        Data: [],
      })

      const result = await fetchBalances({} as any, TEST_ADDRESS_1)
      expect(result).toEqual([])
    })

    it('should throw GalaChainError on API error', async () => {
      const { fetchBalances } = await import('@/lib/galachainClient')
      const { GalaChainResponseError } = await import('@gala-chain/connect')

      mockFetchBalances.mockRejectedValue(
        new GalaChainResponseError({
          error: 'INSUFFICIENT_BALANCE',
          message: 'Not enough tokens',
        })
      )

      await expect(fetchBalances({} as any, TEST_ADDRESS_1)).rejects.toThrow(
        GalaChainError
      )
    })
  })

  describe('fetchAllowances', () => {
    it('should call TokenApi.FetchAllowances with correct parameters', async () => {
      const { fetchAllowances } = await import('@/lib/galachainClient')

      mockFetchAllowances.mockResolvedValue({
        Data: { results: [{ grantedBy: 'eth|0xOwner', quantity: '50' }] },
      })

      const result = await fetchAllowances({} as any, TEST_ADDRESS_1)

      expect(mockFetchAllowances).toHaveBeenCalledWith(
        expect.objectContaining({
          grantedTo: TEST_ADDRESS_1,
        })
      )
      expect(result).toEqual([{ grantedBy: 'eth|0xOwner', quantity: '50' }])
    })

    it('should handle filters with grantedBy', async () => {
      const { fetchAllowances } = await import('@/lib/galachainClient')

      mockFetchAllowances.mockResolvedValue({
        Data: { results: [] },
      })

      await fetchAllowances({} as any, TEST_ADDRESS_1, {
        grantedBy: TEST_ADDRESS_2,
      })

      expect(mockFetchAllowances).toHaveBeenCalledWith(
        expect.objectContaining({
          grantedTo: TEST_ADDRESS_1,
          grantedBy: TEST_ADDRESS_2,
        })
      )
    })
  })

  describe('transfer', () => {
    it('should call TokenApi.TransferToken with correct parameters', async () => {
      const { transfer } = await import('@/lib/galachainClient')
      const BigNumber = (await import('bignumber.js')).default

      mockTransferToken.mockResolvedValue({
        Data: [{ collection: 'GALA', quantity: '100' }],
      })

      await transfer(
        {} as any,
        TEST_ADDRESS_1,
        TEST_ADDRESS_2,
        {
          collection: 'GALA',
          category: 'Unit',
          type: 'none',
          additionalKey: 'none',
          instance: new BigNumber(0),
        },
        new BigNumber('100')
      )

      expect(mockTransferToken).toHaveBeenCalledWith(
        expect.objectContaining({
          from: TEST_ADDRESS_1,
          to: TEST_ADDRESS_2,
          uniqueKey: expect.any(String),
        })
      )
    })

    it('should throw GalaChainError on user rejection', async () => {
      const { transfer } = await import('@/lib/galachainClient')
      const BigNumber = (await import('bignumber.js')).default

      mockTransferToken.mockRejectedValue(new Error('User rejected the request'))

      await expect(
        transfer(
          {} as any,
          TEST_ADDRESS_1,
          TEST_ADDRESS_2,
          {
            collection: 'GALA',
            category: 'Unit',
            type: 'none',
            additionalKey: 'none',
            instance: new BigNumber(0),
          },
          new BigNumber('100')
        )
      ).rejects.toThrow(GalaChainError)
    })
  })

  describe('mint', () => {
    it('should call TokenApi.MintToken with correct parameters', async () => {
      const { mint } = await import('@/lib/galachainClient')
      const BigNumber = (await import('bignumber.js')).default

      mockMintToken.mockResolvedValue({
        Data: [{ collection: 'MyToken', instance: new BigNumber(1) }],
      })

      await mint(
        {} as any,
        {
          collection: 'MyToken',
          category: 'Unit',
          type: 'none',
          additionalKey: 'none',
        },
        TEST_ADDRESS_1,
        new BigNumber('1000')
      )

      expect(mockMintToken).toHaveBeenCalledWith(
        expect.objectContaining({
          owner: TEST_ADDRESS_1,
          uniqueKey: expect.any(String),
        })
      )
    })
  })

  describe('burn', () => {
    it('should call TokenApi.BurnTokens with correct parameters', async () => {
      const { burn } = await import('@/lib/galachainClient')
      const BigNumber = (await import('bignumber.js')).default

      mockBurnTokens.mockResolvedValue({
        Data: [{ burned: true }],
      })

      await burn({} as any, [
        {
          tokenInstanceKey: {
            collection: 'GALA',
            category: 'Unit',
            type: 'none',
            additionalKey: 'none',
            instance: new BigNumber(0),
          },
          quantity: new BigNumber('50'),
        },
      ])

      expect(mockBurnTokens).toHaveBeenCalledWith(
        expect.objectContaining({
          uniqueKey: expect.any(String),
        })
      )
    })
  })

  describe('getGalaChainConfig', () => {
    it('should return the current config', async () => {
      const { getGalaChainConfig } = await import('@/lib/galachainClient')

      const config = getGalaChainConfig()

      expect(config).toEqual({
        env: 'stage',
        gatewayUrl: 'https://gateway-stage.galachain.com',
      })
    })
  })

  describe('createTokenApi', () => {
    it('should create TokenApi with correct URL', async () => {
      const { createTokenApi } = await import('@/lib/galachainClient')
      const { TokenApi } = await import('@gala-chain/connect')

      createTokenApi({} as any)

      // Gateway URL is now the complete token contract URL
      expect(TokenApi).toHaveBeenCalledWith(
        'https://gateway-stage.galachain.com',
        {}
      )
    })
  })
})
