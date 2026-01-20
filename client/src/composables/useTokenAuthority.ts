/**
 * Composable for checking token authority (mint/burn allowances)
 *
 * Provides reactive access to mint/burn authorization status for tokens,
 * allowing components to conditionally render mint/burn buttons.
 */

import { computed } from 'vue'
import { useTokensStore } from '@/stores/tokens'
import { useWalletStore } from '@/stores/wallet'
import BigNumber from 'bignumber.js'
import { AllowanceType } from '@gala-chain/api'
import type { FungibleTokenDisplay, AllowanceDisplay } from '@shared/types/display'

/**
 * Token authority information for a specific token
 */
export interface TokenAuthority {
  /** Whether the user can mint this token */
  canMint: boolean
  /** Whether the user can burn this token */
  canBurn: boolean
  /** Remaining mint allowance (as BigNumber) */
  mintAllowanceRemaining: BigNumber | null
  /** Formatted mint allowance for display */
  mintAllowanceFormatted: string | null
  /** The mint allowance details if available */
  mintAllowance: AllowanceDisplay | null
  /** The burn allowance details if available */
  burnAllowance: AllowanceDisplay | null
}

/**
 * Composable for checking token mint/burn authority
 */
export function useTokenAuthority() {
  const tokensStore = useTokensStore()
  const walletStore = useWalletStore()

  // Computed: user's wallet address
  const walletAddress = computed(() => walletStore.address)

  // Computed: whether user is connected
  const isConnected = computed(() => walletStore.connected)

  /**
   * Get all mint allowances for the current user
   */
  const mintAllowances = computed(() => {
    return tokensStore.allowances.filter(
      (a) => a.allowanceType === AllowanceType.Mint && !a.isExpired
    )
  })

  /**
   * Get all burn allowances for the current user
   */
  const burnAllowances = computed(() => {
    return tokensStore.allowances.filter(
      (a) => a.allowanceType === AllowanceType.Burn && !a.isExpired
    )
  })

  /**
   * Get all tokens the user can mint
   */
  const mintableTokens = computed(() => {
    return tokensStore.tokens.filter((t) => t.canMint)
  })

  /**
   * Get all tokens the user can burn
   */
  const burnableTokens = computed(() => {
    return tokensStore.tokens.filter((t) => t.canBurn)
  })

  /**
   * Check if user has mint authority for a specific token
   */
  function hasMintAuthority(token: FungibleTokenDisplay): boolean {
    return token.canMint
  }

  /**
   * Check if user has burn authority for a specific token
   */
  function hasBurnAuthority(token: FungibleTokenDisplay): boolean {
    return token.canBurn
  }

  /**
   * Get the mint allowance for a specific token
   */
  function getMintAllowance(token: FungibleTokenDisplay): AllowanceDisplay | null {
    return mintAllowances.value.find(
      (a) =>
        a.collection === token.collection &&
        a.category === token.category &&
        a.type === token.type &&
        a.additionalKey === token.additionalKey
    ) || null
  }

  /**
   * Get the burn allowance for a specific token
   */
  function getBurnAllowance(token: FungibleTokenDisplay): AllowanceDisplay | null {
    return burnAllowances.value.find(
      (a) =>
        a.collection === token.collection &&
        a.category === token.category &&
        a.type === token.type &&
        a.additionalKey === token.additionalKey
    ) || null
  }

  /**
   * Get the remaining mint allowance amount for a token
   */
  function getMintAllowanceRemaining(token: FungibleTokenDisplay): BigNumber | null {
    const allowance = getMintAllowance(token)
    if (!allowance) return null

    const remaining = new BigNumber(allowance.quantityRemainingRaw)
    // isGreaterThan(0) ensures we exclude zero and negative values
    return remaining.isGreaterThan(0) ? remaining : null
  }

  /**
   * Get comprehensive authority information for a token
   */
  function getTokenAuthority(token: FungibleTokenDisplay): TokenAuthority {
    const mintAllowance = getMintAllowance(token)
    const burnAllowance = getBurnAllowance(token)
    const mintAllowanceRemaining = getMintAllowanceRemaining(token)

    return {
      canMint: hasMintAuthority(token),
      canBurn: hasBurnAuthority(token),
      mintAllowanceRemaining,
      mintAllowanceFormatted: token.mintAllowanceFormatted || null,
      mintAllowance,
      burnAllowance,
    }
  }

  /**
   * Check if a mint amount is valid (positive and within allowance)
   */
  function isValidMintAmount(token: FungibleTokenDisplay, amount: string): boolean {
    const mintAllowanceRemaining = getMintAllowanceRemaining(token)
    if (!mintAllowanceRemaining) return false

    const amountBN = new BigNumber(amount)
    if (amountBN.isNaN() || amountBN.isLessThanOrEqualTo(0)) return false

    return amountBN.isLessThanOrEqualTo(mintAllowanceRemaining)
  }

  /**
   * Check if a burn amount is valid (positive and within balance)
   */
  function isValidBurnAmount(token: FungibleTokenDisplay, amount: string): boolean {
    const balance = new BigNumber(token.balanceRaw)
    const amountBN = new BigNumber(amount)

    if (amountBN.isNaN() || amountBN.isLessThanOrEqualTo(0)) return false
    return amountBN.isLessThanOrEqualTo(balance)
  }

  return {
    // State
    walletAddress,
    isConnected,

    // Computed lists
    mintAllowances,
    burnAllowances,
    mintableTokens,
    burnableTokens,

    // Check functions
    hasMintAuthority,
    hasBurnAuthority,
    getMintAllowance,
    getBurnAllowance,
    getMintAllowanceRemaining,
    getTokenAuthority,

    // Validation functions
    isValidMintAmount,
    isValidBurnAmount,
  }
}

export type UseTokenAuthority = ReturnType<typeof useTokenAuthority>
