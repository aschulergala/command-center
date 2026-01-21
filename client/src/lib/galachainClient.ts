/**
 * GalaChain client module for chaincode interactions
 *
 * This module provides typed methods for interacting with GalaChain using
 * the @gala-chain/connect library:
 * - TokenApi for token operations (balances, transfers, mints, burns)
 * - BrowserConnectClient for wallet connection and signing
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

/**
 * Wrap API calls with error handling
 */
async function executeApiCall<T>(
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

// ============================================================================
// Token Balance Operations
// ============================================================================

/**
 * Fetch token balances for an address
 */
export async function fetchBalances(
  client: BrowserConnectClient,
  owner: string,
  filters?: {
    collection?: string
    category?: string
    type?: string
    additionalKey?: string
  }
): Promise<TokenBalance[]> {
  const tokenApi = createTokenApi(client)
  const dto = {
    owner: owner as UserRef,
    ...filters,
  }

  logRequest('FetchBalances', dto)

  return executeApiCall(
    () => tokenApi.FetchBalances(dto),
    'FetchBalances'
  )
}

/**
 * Fetch token allowances for an address
 */
export async function fetchAllowances(
  client: BrowserConnectClient,
  grantedTo: string,
  filters?: {
    collection?: string
    category?: string
    type?: string
    additionalKey?: string
    grantedBy?: string
  }
): Promise<TokenAllowance[]> {
  const tokenApi = createTokenApi(client)
  const dto = {
    grantedTo: grantedTo as UserRef,
    ...(filters?.collection && { collection: filters.collection }),
    ...(filters?.category && { category: filters.category }),
    ...(filters?.type && { type: filters.type }),
    ...(filters?.additionalKey && { additionalKey: filters.additionalKey }),
    ...(filters?.grantedBy && { grantedBy: filters.grantedBy as UserRef }),
  }

  logRequest('FetchAllowances', dto)

  const response = await executeApiCall<FetchAllowancesResponse>(
    () => tokenApi.FetchAllowances(dto),
    'FetchAllowances'
  )

  // FetchAllowances returns FetchAllowancesResponse which has 'results' property
  return response.results || []
}

// ============================================================================
// Token Transfer Operations
// ============================================================================

/**
 * Transfer tokens to another address
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

  return executeApiCall(
    () => tokenApi.TransferToken(dto),
    'TransferToken'
  )
}

// ============================================================================
// Token Mint Operations
// ============================================================================

/**
 * Mint tokens (requires mint authority)
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

  return executeApiCall(
    () => tokenApi.MintToken(dto),
    'MintToken'
  )
}

// ============================================================================
// Token Burn Operations
// ============================================================================

/**
 * Burn tokens (requires burn authority or ownership)
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

  return executeApiCall(
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

  return executeApiCall(
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
