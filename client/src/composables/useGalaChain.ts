/**
 * Composable for GalaChain operations
 *
 * Provides reactive access to GalaChain operations integrated with the wallet store.
 * Automatically uses the connected wallet for signing transactions.
 */

import { computed, ref } from 'vue'
import { useWalletStore } from '@/stores/wallet'
import {
  fetchBalances,
  fetchAllowances,
  transfer,
  mint,
  burn,
  getGalaChainConfig,
  type TokenInstanceInput,
  type TokenBalance,
} from '@/lib/galachainClient'
import { GalaChainError, parseWalletError, logError } from '@/lib/galachainErrors'
import type { TokenAllowance } from '@gala-chain/api'
import type BigNumber from 'bignumber.js'

/**
 * Operation state for tracking async operations
 */
export interface OperationState {
  isLoading: boolean
  error: string | null
}

/**
 * Result of an operation
 */
export type OperationResult<T> =
  | { success: true; data: T }
  | { success: false; error: string }

/**
 * Composable for GalaChain operations
 */
export function useGalaChain() {
  const walletStore = useWalletStore()

  // Reactive state
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Computed
  const isConnected = computed(() => walletStore.connected)
  const walletAddress = computed(() => walletStore.address)
  const config = computed(() => getGalaChainConfig())

  /**
   * Get the BrowserConnectClient, throwing if not connected
   */
  function requireClient() {
    const client = walletStore.getClient()
    if (!client) {
      throw new GalaChainError(
        'Wallet not connected. Please connect your wallet first.',
        'WALLET_NOT_CONNECTED'
      )
    }
    return client
  }

  /**
   * Execute an async operation with error handling
   */
  async function executeOperation<T>(
    operation: () => Promise<T>,
    context: string
  ): Promise<OperationResult<T>> {
    isLoading.value = true
    error.value = null

    try {
      const data = await operation()
      return { success: true, data }
    } catch (err) {
      logError(context, err)

      const errorMessage =
        err instanceof GalaChainError
          ? err.message
          : parseWalletError(err)

      error.value = errorMessage
      return { success: false, error: errorMessage }
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Clear the current error state
   */
  function clearError() {
    error.value = null
  }

  // ============================================================================
  // Read Operations
  // ============================================================================

  /**
   * Fetch token balances for an address
   * @param owner - Optional owner address (defaults to connected wallet)
   * @param filters - Optional filters for collection, category, type, additionalKey
   */
  async function getBalances(
    owner?: string,
    filters?: {
      collection?: string
      category?: string
      type?: string
      additionalKey?: string
    }
  ): Promise<OperationResult<TokenBalance[]>> {
    return executeOperation(async () => {
      const client = requireClient()
      const address = owner || walletStore.address
      if (!address) {
        throw new GalaChainError('No wallet address available.', 'NO_ADDRESS')
      }
      return fetchBalances(client, address, filters)
    }, 'getBalances')
  }

  /**
   * Fetch token allowances for an address
   * @param grantedTo - Optional address to check allowances for (defaults to connected wallet)
   * @param filters - Optional filters for collection, category, type, etc.
   */
  async function getAllowances(
    grantedTo?: string,
    filters?: {
      collection?: string
      category?: string
      type?: string
      additionalKey?: string
      grantedBy?: string
    }
  ): Promise<OperationResult<TokenAllowance[]>> {
    return executeOperation(async () => {
      const client = requireClient()
      const address = grantedTo || walletStore.address
      if (!address) {
        throw new GalaChainError('No wallet address available.', 'NO_ADDRESS')
      }
      return fetchAllowances(client, address, filters)
    }, 'getAllowances')
  }

  // ============================================================================
  // Write Operations (requires signing)
  // ============================================================================

  /**
   * Transfer tokens to another address
   * @param to - Recipient address
   * @param tokenInstance - Token to transfer
   * @param quantity - Amount to transfer
   */
  async function transferToken(
    to: string,
    tokenInstance: TokenInstanceInput,
    quantity: BigNumber | string | number
  ): Promise<OperationResult<TokenBalance[]>> {
    return executeOperation(async () => {
      const client = requireClient()
      const from = walletStore.address
      if (!from) {
        throw new GalaChainError('No wallet address available.', 'NO_ADDRESS')
      }
      return transfer(client, from, to, tokenInstance, quantity)
    }, 'transferToken')
  }

  /**
   * Mint tokens (requires mint authority)
   * @param tokenClass - Token class to mint
   * @param quantity - Amount to mint
   * @param owner - Recipient of minted tokens (defaults to connected wallet)
   */
  async function mintToken(
    tokenClass: {
      collection: string
      category: string
      type: string
      additionalKey: string
    },
    quantity: BigNumber | string | number,
    owner?: string
  ): Promise<OperationResult<unknown[]>> {
    return executeOperation(async () => {
      const client = requireClient()
      const recipient = owner || walletStore.address
      if (!recipient) {
        throw new GalaChainError('No wallet address available.', 'NO_ADDRESS')
      }
      return mint(client, tokenClass, recipient, quantity)
    }, 'mintToken')
  }

  /**
   * Burn tokens (requires burn authority or ownership)
   * @param tokenInstances - Array of tokens and quantities to burn
   */
  async function burnTokens(
    tokenInstances: Array<{
      tokenInstanceKey: TokenInstanceInput
      quantity: BigNumber | string | number
    }>
  ): Promise<OperationResult<unknown[]>> {
    return executeOperation(async () => {
      const client = requireClient()
      return burn(client, tokenInstances)
    }, 'burnTokens')
  }

  return {
    // State
    isLoading,
    error,

    // Computed
    isConnected,
    walletAddress,
    config,

    // Actions
    clearError,

    // Read operations
    getBalances,
    getAllowances,

    // Write operations
    transferToken,
    mintToken,
    burnTokens,
  }
}

// Export types for use in components
export type UseGalaChain = ReturnType<typeof useGalaChain>
