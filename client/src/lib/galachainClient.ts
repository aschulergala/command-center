/**
 * GalaChain client module for chaincode interactions
 *
 * This module provides typed methods for interacting with GalaChain:
 * - Read operations (FetchBalances, FetchAllowances) - No signing required
 * - Write operations (Transfer, Mint, Burn) - Require wallet signing via BrowserConnectClient
 */

import { BrowserConnectClient, TokenApi, GalaChainResponseError } from '@gala-chain/connect'
import type { TokenBalance, TokenInstanceKey, TokenClassKey, TokenClass } from '@gala-chain/connect'
import type { TokenAllowance, FetchAllowancesResponse, UserRef } from '@gala-chain/api'
import BigNumber from 'bignumber.js'
import { config } from './config'
import { GalaChainError, logError } from './galachainErrors'

/**
 * Get the token API URL based on environment
 * The gateway URL is the complete URL to the token contract
 */
function getTokenApiUrl(): string {
  return config.galachain.gatewayUrl
}

/**
 * Create a TokenApi instance from a BrowserConnectClient
 * Used for write operations that require signing
 */
export function createTokenApi(client: BrowserConnectClient): TokenApi {
  return new TokenApi(getTokenApiUrl(), client)
}

/**
 * Token instance input for operations (accepts both BigNumber and primitives)
 */
export interface TokenInstanceInput {
  collection: string
  category: string
  type: string
  additionalKey: string
  instance: BigNumber | string | number
}

/**
 * Convert a primitive instance value to BigNumber
 */
function toBigNumber(value: BigNumber | string | number): BigNumber {
  if (value instanceof BigNumber) {
    return value
  }
  return new BigNumber(value)
}

/**
 * Generate a unique key for submit DTOs
 * This ensures each transaction is unique and prevents replay attacks
 */
function generateUniqueKey(): string {
  // Generate a random base64 string similar to SDK pattern
  const randomBytes = new Uint8Array(32)
  crypto.getRandomValues(randomBytes)
  return btoa(String.fromCharCode(...randomBytes))
}

/**
 * Log request/response in development mode
 */
function logRequest(method: string, dto: unknown): void {
  if (import.meta.env.DEV) {
    console.log(`[GalaChain] ${method}`, dto)
  }
}

function logResponse<T>(method: string, response: T): void {
  if (import.meta.env.DEV) {
    console.log(`[GalaChain] ${method} response:`, response)
  }
}

// ============================================================================
// Unsigned Read Operations (No wallet required)
// ============================================================================

/**
 * GalaChain API response structure
 */
interface GalaChainResponse<T> {
  Status: number
  Data?: T
  Message?: string
  Error?: string
  ErrorCode?: number
}

/**
 * Make an unsigned HTTP POST request to the GalaChain API
 * Used for read operations that don't require signing
 */
async function unsignedPost<T>(method: string, dto: object): Promise<T> {
  const url = `${getTokenApiUrl()}/${method}`

  logRequest(method, dto)

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dto),
    })

    if (!response.ok) {
      throw new GalaChainError(
        `HTTP error: ${response.status} ${response.statusText}`,
        'NETWORK_ERROR'
      )
    }

    const result: GalaChainResponse<T> = await response.json()

    logResponse(method, result)

    // Check for GalaChain error response (Status !== 1 indicates error)
    if (result.Status !== 1) {
      throw new GalaChainError(
        result.Message || result.Error || `Operation failed with status ${result.Status}`,
        result.Error || 'API_ERROR',
        undefined,
        { errorCode: result.ErrorCode }
      )
    }

    return result.Data as T
  } catch (err) {
    logError(method, err)

    if (err instanceof GalaChainError) {
      throw err
    }

    if (err instanceof Error) {
      // Network or fetch errors
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        throw new GalaChainError(
          'Unable to connect to GalaChain. Please check your network connection.',
          'NETWORK_ERROR'
        )
      }
      throw new GalaChainError(err.message, 'UNKNOWN_ERROR')
    }

    throw new GalaChainError('An unexpected error occurred.', 'UNKNOWN_ERROR')
  }
}

/**
 * Fetch token balances for an address
 * This is a read-only operation that does NOT require wallet signing
 */
export async function fetchBalances(
  owner: string,
  filters?: {
    collection?: string
    category?: string
    type?: string
    additionalKey?: string
  }
): Promise<TokenBalance[]> {
  const dto = {
    owner: owner as UserRef,
    ...filters,
  }

  return unsignedPost<TokenBalance[]>('FetchBalances', dto)
}

/**
 * Fetch token allowances for an address
 * This is a read-only operation that does NOT require wallet signing
 */
export async function fetchAllowances(
  grantedTo: string,
  filters?: {
    collection?: string
    category?: string
    type?: string
    additionalKey?: string
    grantedBy?: string
  }
): Promise<TokenAllowance[]> {
  const dto = {
    grantedTo: grantedTo as UserRef,
    ...(filters?.collection && { collection: filters.collection }),
    ...(filters?.category && { category: filters.category }),
    ...(filters?.type && { type: filters.type }),
    ...(filters?.additionalKey && { additionalKey: filters.additionalKey }),
    ...(filters?.grantedBy && { grantedBy: filters.grantedBy as UserRef }),
  }

  const response = await unsignedPost<FetchAllowancesResponse>('FetchAllowances', dto)

  // FetchAllowances returns FetchAllowancesResponse which has 'results' property
  return response.results || []
}

// ============================================================================
// Signed Write Operations (Wallet required)
// ============================================================================

/**
 * Wrap API calls with error handling for signed operations
 */
async function executeSignedApiCall<T>(
  operation: () => Promise<{ Data: T }>,
  context: string
): Promise<T> {
  try {
    const response = await operation()
    logResponse(context, response)
    return response.Data
  } catch (err) {
    logError(context, err)

    if (err instanceof GalaChainResponseError) {
      throw new GalaChainError(
        err.Message || `Operation failed: ${err.Error}`,
        err.Error,
        undefined,
        { errorCode: err.ErrorCode }
      )
    }

    if (err instanceof Error) {
      // Handle wallet/network errors
      const message = err.message.toLowerCase()
      if (message.includes('user rejected') || message.includes('user denied')) {
        throw new GalaChainError(
          'Transaction was rejected. Please approve the transaction in your wallet to continue.',
          'USER_REJECTED'
        )
      }
      throw new GalaChainError(err.message, 'UNKNOWN_ERROR')
    }

    throw new GalaChainError('An unexpected error occurred.', 'UNKNOWN_ERROR')
  }
}

/**
 * Transfer tokens to another address
 * Requires wallet connection for signing
 */
export async function transfer(
  client: BrowserConnectClient,
  from: string,
  to: string,
  tokenInstance: TokenInstanceInput,
  quantity: BigNumber | string | number
): Promise<TokenBalance[]> {
  const tokenApi = createTokenApi(client)
  const dto = {
    from: from as UserRef,
    to: to as UserRef,
    tokenInstance: {
      collection: tokenInstance.collection,
      category: tokenInstance.category,
      type: tokenInstance.type,
      additionalKey: tokenInstance.additionalKey,
      instance: toBigNumber(tokenInstance.instance),
    },
    quantity: toBigNumber(quantity),
    uniqueKey: generateUniqueKey(),
  }

  logRequest('TransferToken', dto)

  return executeSignedApiCall(
    () => tokenApi.TransferToken(dto),
    'TransferToken'
  )
}

/**
 * Mint tokens (requires mint authority)
 * Requires wallet connection for signing
 */
export async function mint(
  client: BrowserConnectClient,
  tokenClass: {
    collection: string
    category: string
    type: string
    additionalKey: string
  },
  owner: string,
  quantity: BigNumber | string | number
): Promise<TokenInstanceKey[]> {
  const tokenApi = createTokenApi(client)
  const dto = {
    tokenClass,
    owner: owner as UserRef,
    quantity: toBigNumber(quantity),
    uniqueKey: generateUniqueKey(),
  }

  logRequest('MintToken', dto)

  return executeSignedApiCall(
    () => tokenApi.MintToken(dto),
    'MintToken'
  )
}

/**
 * Burn tokens (requires burn authority or ownership)
 * Requires wallet connection for signing
 */
export async function burn(
  client: BrowserConnectClient,
  tokenInstances: Array<{
    tokenInstanceKey: TokenInstanceInput
    quantity: BigNumber | string | number
  }>
): Promise<unknown[]> {
  const tokenApi = createTokenApi(client)
  const dto = {
    tokenInstances: tokenInstances.map(item => ({
      tokenInstanceKey: {
        collection: item.tokenInstanceKey.collection,
        category: item.tokenInstanceKey.category,
        type: item.tokenInstanceKey.type,
        additionalKey: item.tokenInstanceKey.additionalKey,
        instance: toBigNumber(item.tokenInstanceKey.instance),
      },
      quantity: toBigNumber(item.quantity),
    })),
    uniqueKey: generateUniqueKey(),
  }

  logRequest('BurnTokens', dto)

  return executeSignedApiCall(
    () => tokenApi.BurnTokens(dto),
    'BurnTokens'
  )
}

// ============================================================================
// Token Class Operations
// ============================================================================

/**
 * Input for creating a new token class/collection
 */
export interface CreateTokenClassInput {
  /** Token class key identifying the collection */
  tokenClass: {
    collection: string
    category: string
    type: string
    additionalKey: string
  }
  /** Human-readable name */
  name: string
  /** Token symbol (e.g., "BTC", "ETH") */
  symbol: string
  /** Description of the token */
  description: string
  /** Image URL for the token */
  image: string
  /** Whether this is an NFT collection (default: true) */
  isNonFungible?: boolean
  /** Number of decimal places (default: 0 for NFTs) */
  decimals?: number
  /** Maximum supply (default: unlimited) */
  maxSupply?: BigNumber | string | number
  /** Maximum capacity per wallet (default: unlimited) */
  maxCapacity?: BigNumber | string | number
  /** Rarity level (optional) */
  rarity?: string
  /** Authorities who can manage this token (defaults to creator) */
  authorities?: string[]
}

/**
 * Create a new token class/collection
 * This creates the token definition on-chain. The creator becomes the authority.
 * Requires wallet connection for signing
 */
export async function createCollection(
  client: BrowserConnectClient,
  input: CreateTokenClassInput
): Promise<TokenClass> {
  const tokenApi = createTokenApi(client)

  // Build the base DTO with required fields
  // Use type assertion since the SDK types don't perfectly match the API
  const dto = {
    tokenClass: {
      collection: input.tokenClass.collection,
      category: input.tokenClass.category,
      type: input.tokenClass.type,
      additionalKey: input.tokenClass.additionalKey,
    },
    name: input.name,
    symbol: input.symbol,
    description: input.description,
    image: input.image,
    isNonFungible: input.isNonFungible ?? true,
    decimals: input.decimals ?? 0,
    uniqueKey: generateUniqueKey(),
    // Optional fields with defaults
    ...(input.maxSupply !== undefined && { maxSupply: toBigNumber(input.maxSupply) }),
    ...(input.maxCapacity !== undefined && { maxCapacity: toBigNumber(input.maxCapacity) }),
    ...(input.rarity && { rarity: input.rarity }),
    ...(input.authorities && input.authorities.length > 0 && { authorities: input.authorities }),
  }

  logRequest('CreateTokenClass', dto)

  return executeSignedApiCall(
    // Cast to any then to the expected type since SDK types are stricter than API
    () => tokenApi.CreateTokenClass(dto as Parameters<typeof tokenApi.CreateTokenClass>[0]),
    'CreateTokenClass'
  )
}

// ============================================================================
// Environment Configuration Export
// ============================================================================

/**
 * Get the current GalaChain environment configuration
 */
export function getGalaChainConfig() {
  return {
    env: config.galachain.env,
    gatewayUrl: config.galachain.gatewayUrl,
  }
}

/**
 * Re-export types for convenience
 */
export type { TokenBalance, TokenInstanceKey, TokenClassKey, TokenClass }
