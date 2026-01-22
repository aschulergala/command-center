import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import BigNumber from 'bignumber.js'
import type { TokenBalance as TokenBalanceConnect } from '@gala-chain/connect'
import type { TokenAllowance, AllowanceType, TokenBalanceWithMetadata, TokenClass, TokenBalance as TokenBalanceApi } from '@gala-chain/api'
import type { FungibleTokenDisplay, AllowanceDisplay } from '@shared/types/display'
import { getTokenIdentifier } from '@/lib/tokenUtils'

// Use a unified type that works for both API sources
// TokenBalance from @gala-chain/api has some private properties that don't exist in @gala-chain/connect version
// We use 'any' for the internal raw storage and type-cast when needed
type TokenBalanceAny = TokenBalanceConnect | TokenBalanceApi

// Interface for accessing TokenBalance properties regardless of source
// This helps with type casting when accessing properties that may be private in one variant
interface TokenBalanceData {
  collection: string
  category: string
  type: string
  additionalKey: string
  quantity?: BigNumber
  instanceIds?: BigNumber[]
  lockedHolds?: Array<{ quantity: BigNumber; instanceId?: BigNumber }>
  inUseHolds?: Array<{ quantity: BigNumber; instanceId?: BigNumber }>
}

/**
 * Sort options for the token list
 */
export type TokenSortOption = 'balance-desc' | 'balance-asc' | 'name-asc' | 'name-desc'

/**
 * Calculate the total locked balance from holds array
 */
function calculateLockedBalance(holds: Array<{ quantity: BigNumber }> | undefined): BigNumber {
  if (!holds || holds.length === 0) return new BigNumber(0)
  return holds.reduce((sum, hold) => {
    const qty = new BigNumber(hold.quantity?.toString() || '0')
    return sum.plus(qty)
  }, new BigNumber(0))
}

/**
 * Format a balance for display
 * Note: GalaChain quantity values are already the actual token amounts - no decimal conversion needed
 */
function formatBalance(balance: BigNumber, _decimals: number = 8): string {
  if (balance.isZero()) return '0'

  // Use toFormat for thousands separators
  if (balance.isGreaterThanOrEqualTo(1000)) {
    return balance.toFormat(2)
  }

  // For smaller numbers, show more precision
  if (balance.isLessThan(0.0001)) {
    return balance.toExponential(2)
  }

  return balance.toFormat(4)
}

/**
 * Convert a TokenBalance (with optional metadata) to FungibleTokenDisplay
 */
function toFungibleTokenDisplay(
  balance: TokenBalanceAny,
  mintAllowances: TokenAllowance[],
  burnAllowances: TokenAllowance[],
  tokenMetadata?: TokenClass
): FungibleTokenDisplay {
  // Cast to data interface for property access (avoids private property issues)
  const b = balance as unknown as TokenBalanceData
  const tokenKey = `${b.collection}|${b.category}|${b.type}|${b.additionalKey}`

  // Calculate balances
  const totalBalance = new BigNumber(b.quantity?.toString() || '0')
  const lockedBalance = calculateLockedBalance(b.lockedHolds)
  const inUseBalance = calculateLockedBalance(b.inUseHolds)
  const spendableBalance = totalBalance.minus(lockedBalance).minus(inUseBalance)

  // Check for mint allowances for this token
  const hasMintAllowance = mintAllowances.some(
    a => a.collection === b.collection &&
         a.category === b.category &&
         a.type === b.type &&
         a.additionalKey === b.additionalKey
  )

  // Users can burn tokens if:
  // 1. They own tokens (have a positive balance), OR
  // 2. They have burn authority (burn allowance)
  const hasBurnAllowance = burnAllowances.some(
    a => a.collection === b.collection &&
         a.category === b.category &&
         a.type === b.type &&
         a.additionalKey === b.additionalKey
  )
  const hasBalance = totalBalance.isGreaterThan(0)
  const canBurnToken = hasBalance || hasBurnAllowance

  // Get mint allowance amount if exists
  const mintAllowance = mintAllowances.find(
    a => a.collection === b.collection &&
         a.category === b.category &&
         a.type === b.type &&
         a.additionalKey === b.additionalKey
  )
  const mintAllowanceRemaining = mintAllowance
    ? new BigNumber(mintAllowance.quantity?.toString() || '0')
        .minus(new BigNumber(mintAllowance.quantitySpent?.toString() || '0'))
    : undefined

  // Use metadata if available, otherwise fall back to defaults
  // For default name/symbol, use getTokenIdentifier which returns collection if not 'Token', otherwise type
  const tokenIdentifier = getTokenIdentifier(b)
  const decimals = tokenMetadata?.decimals ?? 8
  const name = tokenMetadata?.name || tokenIdentifier || 'Unknown Token'
  const symbol = tokenMetadata?.symbol || tokenIdentifier || '???'
  const description = tokenMetadata?.description || ''
  const image = tokenMetadata?.image || ''

  return {
    tokenKey,
    collection: b.collection,
    category: b.category,
    type: b.type,
    additionalKey: b.additionalKey,
    name,
    symbol,
    description,
    image,
    decimals,
    balanceRaw: totalBalance.toString(),
    balanceFormatted: formatBalance(totalBalance, decimals),
    lockedBalanceRaw: lockedBalance.toString(),
    lockedBalanceFormatted: formatBalance(lockedBalance, decimals),
    spendableBalanceRaw: spendableBalance.toString(),
    spendableBalanceFormatted: formatBalance(spendableBalance, decimals),
    canMint: hasMintAllowance,
    canBurn: canBurnToken,
    mintAllowanceRaw: mintAllowanceRemaining?.toString(),
    mintAllowanceFormatted: mintAllowanceRemaining ? formatBalance(mintAllowanceRemaining, decimals) : undefined,
  }
}

/**
 * Convert a TokenAllowance to AllowanceDisplay
 */
function toAllowanceDisplay(allowance: TokenAllowance): AllowanceDisplay {
  const allowanceKey = `${allowance.collection}|${allowance.category}|${allowance.type}|${allowance.additionalKey}|${allowance.grantedBy}|${allowance.allowanceType}`

  const quantity = new BigNumber(allowance.quantity?.toString() || '0')
  const quantitySpent = new BigNumber(allowance.quantitySpent?.toString() || '0')
  const quantityRemaining = quantity.minus(quantitySpent)
  const uses = new BigNumber(allowance.uses?.toString() || '0')
  const usesSpent = new BigNumber(allowance.usesSpent?.toString() || '0')
  const expires = Number(allowance.expires || 0)
  const isExpired = expires > 0 && Date.now() > expires

  return {
    allowanceKey,
    collection: allowance.collection,
    category: allowance.category,
    type: allowance.type,
    additionalKey: allowance.additionalKey,
    instance: allowance.instance?.toString() || '0',
    allowanceType: allowance.allowanceType,
    grantedBy: allowance.grantedBy,
    grantedTo: allowance.grantedTo,
    quantityRaw: quantity.toString(),
    quantitySpentRaw: quantitySpent.toString(),
    quantityRemainingRaw: quantityRemaining.toString(),
    quantityRemainingFormatted: formatBalance(quantityRemaining),
    usesRaw: uses.toString(),
    usesSpentRaw: usesSpent.toString(),
    expires,
    isExpired,
    expiresFormatted: expires > 0 ? new Date(expires).toLocaleDateString() : 'Never',
  }
}

/**
 * Pinia store for managing fungible token state
 */
export const useTokensStore = defineStore('tokens', () => {
  // State
  const tokens = ref<FungibleTokenDisplay[]>([])
  // Allowances granted TO the user (user is grantedTo)
  const allowancesReceived = ref<AllowanceDisplay[]>([])
  // Allowances granted BY the user (user is grantedBy)
  // Note: GalaChain API currently doesn't support querying by grantedBy without grantedTo
  const allowancesGranted = ref<AllowanceDisplay[]>([])
  const isLoading = ref(false)
  const isLoadingAllowances = ref(false)
  const error = ref<string | null>(null)
  const sortBy = ref<TokenSortOption>('balance-desc')
  const lastFetched = ref<number | null>(null)

  // Raw data from API (for re-processing when allowances change)
  // Using plain variables to avoid Vue reactivity wrapping complex GalaChain types
  // Use TokenBalanceAny to handle both @gala-chain/connect and @gala-chain/api versions
  let rawBalances: TokenBalanceAny[] = []
  let rawBalancesWithMetadata: TokenBalanceWithMetadata[] = []
  let rawMintAllowances: TokenAllowance[] = []
  let rawBurnAllowances: TokenAllowance[] = []
  let usingMetadata = false // Track whether we have metadata

  // Getters
  const sortedTokens = computed(() => {
    const sorted = [...tokens.value]

    switch (sortBy.value) {
      case 'balance-desc':
        return sorted.sort((a, b) => {
          const aBalance = new BigNumber(a.balanceRaw)
          const bBalance = new BigNumber(b.balanceRaw)
          const cmp = bBalance.comparedTo(aBalance)
          return cmp === null ? 0 : cmp
        })
      case 'balance-asc':
        return sorted.sort((a, b) => {
          const aBalance = new BigNumber(a.balanceRaw)
          const bBalance = new BigNumber(b.balanceRaw)
          const cmp = aBalance.comparedTo(bBalance)
          return cmp === null ? 0 : cmp
        })
      case 'name-asc':
        return sorted.sort((a, b) => a.name.localeCompare(b.name))
      case 'name-desc':
        return sorted.sort((a, b) => b.name.localeCompare(a.name))
      default:
        return sorted
    }
  })

  const hasTokens = computed(() => tokens.value.length > 0)

  const totalValue = computed(() => {
    // Placeholder - would need price data to calculate actual value
    return null
  })

  const mintableTokens = computed(() =>
    tokens.value.filter(t => t.canMint)
  )

  const burnableTokens = computed(() =>
    tokens.value.filter(t => t.canBurn)
  )

  // Actions

  /**
   * Set the raw balances and process into display tokens
   * @deprecated Use setBalancesWithMetadata for better display data
   */
  function setBalances(balances: TokenBalanceAny[]): void {
    rawBalances = balances
    rawBalancesWithMetadata = []
    usingMetadata = false
    processTokens()
  }

  /**
   * Set the raw balances with metadata and process into display tokens
   * This is the preferred method as it includes token class data (name, symbol, image, etc.)
   */
  function setBalancesWithMetadata(balancesWithMetadata: TokenBalanceWithMetadata[]): void {
    rawBalancesWithMetadata = balancesWithMetadata
    // Also extract plain balances for backward compatibility
    rawBalances = balancesWithMetadata.map(bm => bm.balance)
    usingMetadata = true
    processTokens()
  }

  /**
   * Set the raw allowances received (granted TO the user)
   */
  function setAllowancesReceived(
    allAllowances: TokenAllowance[],
    mintType: AllowanceType,
    burnType: AllowanceType
  ): void {
    rawMintAllowances = allAllowances.filter(a => a.allowanceType === mintType)
    rawBurnAllowances = allAllowances.filter(a => a.allowanceType === burnType)

    // Convert all allowances to display format
    allowancesReceived.value = allAllowances.map(toAllowanceDisplay)

    // Re-process tokens to update canMint/canBurn flags
    processTokens()
  }

  /**
   * Set the raw allowances granted (granted BY the user)
   * Note: This may be empty if the API doesn't support querying by grantedBy
   */
  function setAllowancesGranted(
    allAllowances: TokenAllowance[]
  ): void {
    allowancesGranted.value = allAllowances.map(toAllowanceDisplay)
  }

  /**
   * Check if a balance represents a fungible token (instance 0 or no instances)
   * Cast to any to access instanceIds regardless of TokenBalance variant
   */
  function isFungibleBalance(balance: TokenBalanceAny): boolean {
    const b = balance as { instanceIds?: BigNumber[] }
    if (!b.instanceIds || b.instanceIds.length === 0) return true
    const instance = new BigNumber(b.instanceIds[0]?.toString() || '0')
    return instance.isZero()
  }

  /**
   * Process raw balances into display tokens
   */
  function processTokens(): void {
    if (usingMetadata && rawBalancesWithMetadata.length > 0) {
      // Use balances with metadata - filter for fungible tokens
      const fungibleBalancesWithMetadata = rawBalancesWithMetadata.filter(bm => isFungibleBalance(bm.balance))

      tokens.value = fungibleBalancesWithMetadata.map(bm =>
        toFungibleTokenDisplay(bm.balance, rawMintAllowances, rawBurnAllowances, bm.token)
      )
    } else {
      // Fallback to plain balances without metadata
      const fungibleBalances = rawBalances.filter(b => isFungibleBalance(b))

      tokens.value = fungibleBalances.map(b =>
        toFungibleTokenDisplay(b, rawMintAllowances, rawBurnAllowances)
      )
    }

    lastFetched.value = Date.now()
  }

  /**
   * Set loading state
   */
  function setLoading(loading: boolean): void {
    isLoading.value = loading
  }

  /**
   * Set allowances loading state
   */
  function setLoadingAllowances(loading: boolean): void {
    isLoadingAllowances.value = loading
  }

  /**
   * Set error state
   */
  function setError(errorMessage: string | null): void {
    error.value = errorMessage
  }

  /**
   * Update the sort order
   */
  function setSort(option: TokenSortOption): void {
    sortBy.value = option
  }

  /**
   * Clear all token data
   */
  function clearTokens(): void {
    tokens.value = []
    allowancesReceived.value = []
    allowancesGranted.value = []
    rawBalances = []
    rawBalancesWithMetadata = []
    rawMintAllowances = []
    rawBurnAllowances = []
    usingMetadata = false
    lastFetched.value = null
    error.value = null
  }

  /**
   * Find a token by its key
   */
  function getTokenByKey(tokenKey: string): FungibleTokenDisplay | undefined {
    return tokens.value.find(t => t.tokenKey === tokenKey)
  }

  /**
   * Check if data needs refresh (older than 30 seconds)
   */
  function needsRefresh(): boolean {
    if (!lastFetched.value) return true
    return Date.now() - lastFetched.value > 30000
  }

  // Computed: combined allowances for backward compatibility
  const allowances = computed(() => [...allowancesReceived.value, ...allowancesGranted.value])

  return {
    // State
    tokens,
    allowancesReceived,
    allowancesGranted,
    allowances, // Combined for backward compatibility
    isLoading,
    isLoadingAllowances,
    error,
    sortBy,
    lastFetched,

    // Getters
    sortedTokens,
    hasTokens,
    totalValue,
    mintableTokens,
    burnableTokens,

    // Actions
    setBalances,
    setBalancesWithMetadata,
    setAllowancesReceived,
    setAllowancesGranted,
    setLoading,
    setLoadingAllowances,
    setError,
    setSort,
    clearTokens,
    getTokenByKey,
    needsRefresh,
  }
})

// Export types for testing
export type TokensStore = ReturnType<typeof useTokensStore>
