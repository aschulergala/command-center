import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import BigNumber from 'bignumber.js'
import type { TokenBalance } from '@gala-chain/connect'
import type { TokenAllowance, AllowanceType } from '@gala-chain/api'
import type { FungibleTokenDisplay, AllowanceDisplay } from '@shared/types/display'

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
 * Format a balance with proper decimals
 */
function formatBalance(balance: BigNumber, decimals: number = 8): string {
  if (balance.isZero()) return '0'

  // Format with up to 4 decimal places for display
  const formatted = balance.dividedBy(new BigNumber(10).pow(decimals))

  // Use toFormat for thousands separators
  if (formatted.isGreaterThanOrEqualTo(1000)) {
    return formatted.toFormat(2)
  }

  // For smaller numbers, show more precision
  if (formatted.isLessThan(0.0001)) {
    return formatted.toExponential(2)
  }

  return formatted.toFormat(4)
}

/**
 * Convert a TokenBalance to FungibleTokenDisplay
 */
function toFungibleTokenDisplay(
  balance: TokenBalance,
  mintAllowances: TokenAllowance[],
  burnAllowances: TokenAllowance[]
): FungibleTokenDisplay {
  const tokenKey = `${balance.collection}|${balance.category}|${balance.type}|${balance.additionalKey}`

  // Calculate balances
  const totalBalance = new BigNumber(balance.quantity?.toString() || '0')
  const lockedBalance = calculateLockedBalance(balance.lockedHolds)
  const inUseBalance = calculateLockedBalance(balance.inUseHolds)
  const spendableBalance = totalBalance.minus(lockedBalance).minus(inUseBalance)

  // Check for mint/burn allowances for this token
  const hasMintAllowance = mintAllowances.some(
    a => a.collection === balance.collection &&
         a.category === balance.category &&
         a.type === balance.type &&
         a.additionalKey === balance.additionalKey
  )

  const hasBurnAllowance = burnAllowances.some(
    a => a.collection === balance.collection &&
         a.category === balance.category &&
         a.type === balance.type &&
         a.additionalKey === balance.additionalKey
  )

  // Get mint allowance amount if exists
  const mintAllowance = mintAllowances.find(
    a => a.collection === balance.collection &&
         a.category === balance.category &&
         a.type === balance.type &&
         a.additionalKey === balance.additionalKey
  )
  const mintAllowanceRemaining = mintAllowance
    ? new BigNumber(mintAllowance.quantity?.toString() || '0')
        .minus(new BigNumber(mintAllowance.quantitySpent?.toString() || '0'))
    : undefined

  const decimals = 8 // Default decimals

  return {
    tokenKey,
    collection: balance.collection,
    category: balance.category,
    type: balance.type,
    additionalKey: balance.additionalKey,
    // Name/symbol fallback to type for now (can be enhanced with metadata)
    name: balance.type || 'Unknown Token',
    symbol: balance.type || '???',
    description: '',
    image: '',
    decimals,
    balanceRaw: totalBalance.toString(),
    balanceFormatted: formatBalance(totalBalance, decimals),
    lockedBalanceRaw: lockedBalance.toString(),
    lockedBalanceFormatted: formatBalance(lockedBalance, decimals),
    spendableBalanceRaw: spendableBalance.toString(),
    spendableBalanceFormatted: formatBalance(spendableBalance, decimals),
    canMint: hasMintAllowance,
    canBurn: hasBurnAllowance,
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
  const allowances = ref<AllowanceDisplay[]>([])
  const isLoading = ref(false)
  const isLoadingAllowances = ref(false)
  const error = ref<string | null>(null)
  const sortBy = ref<TokenSortOption>('balance-desc')
  const lastFetched = ref<number | null>(null)

  // Raw data from API (for re-processing when allowances change)
  // Using plain variables to avoid Vue reactivity wrapping complex GalaChain types
  let rawBalances: TokenBalance[] = []
  let rawMintAllowances: TokenAllowance[] = []
  let rawBurnAllowances: TokenAllowance[] = []

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
   */
  function setBalances(balances: TokenBalance[]): void {
    rawBalances = balances
    processTokens()
  }

  /**
   * Set the raw allowances
   */
  function setAllowances(
    allAllowances: TokenAllowance[],
    mintType: AllowanceType,
    burnType: AllowanceType
  ): void {
    rawMintAllowances = allAllowances.filter(a => a.allowanceType === mintType)
    rawBurnAllowances = allAllowances.filter(a => a.allowanceType === burnType)

    // Convert all allowances to display format
    allowances.value = allAllowances.map(toAllowanceDisplay)

    // Re-process tokens to update canMint/canBurn flags
    processTokens()
  }

  /**
   * Process raw balances into display tokens
   */
  function processTokens(): void {
    // Filter for fungible tokens only (no instanceIds or first instance is 0)
    const fungibleBalances = rawBalances.filter(b => {
      if (!b.instanceIds || b.instanceIds.length === 0) return true
      const instance = new BigNumber(b.instanceIds[0]?.toString() || '0')
      return instance.isZero()
    })

    tokens.value = fungibleBalances.map(b =>
      toFungibleTokenDisplay(b, rawMintAllowances, rawBurnAllowances)
    )

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
    allowances.value = []
    rawBalances = []
    rawMintAllowances = []
    rawBurnAllowances = []
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

  return {
    // State
    tokens,
    allowances,
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
    setAllowances,
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
