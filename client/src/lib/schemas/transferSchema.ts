/**
 * Zod validation schemas for token transfer operations
 */

import { z } from 'zod'
import BigNumber from 'bignumber.js'

/**
 * Validate that a string is a valid GalaChain address format
 * GalaChain addresses are in format: client|<hex> or eth|<hex>
 */
export function isValidGalaChainAddress(address: string): boolean {
  // GalaChain addresses can be:
  // - client|<hex> format
  // - eth|<hex> format (Ethereum addresses)
  // - Raw hex addresses (0x prefixed)

  if (!address || typeof address !== 'string') {
    return false
  }

  const trimmed = address.trim()

  // client|... or eth|... format
  if (trimmed.includes('|')) {
    const parts = trimmed.split('|')
    if (parts.length !== 2) {
      return false
    }
    const [prefix, hex] = parts
    if (!['client', 'eth'].includes(prefix.toLowerCase())) {
      return false
    }
    // Check hex part is valid (alphanumeric, at least 20 chars for Ethereum addresses)
    return /^[a-fA-F0-9]{20,}$/.test(hex)
  }

  // 0x prefixed Ethereum address
  if (trimmed.startsWith('0x')) {
    return /^0x[a-fA-F0-9]{40}$/.test(trimmed)
  }

  return false
}

/**
 * Validate that a string is a valid positive number
 */
export function isValidAmount(amount: string): boolean {
  if (!amount || typeof amount !== 'string') {
    return false
  }

  const trimmed = amount.trim()
  if (trimmed === '' || trimmed === '.' || trimmed === '-') {
    return false
  }

  const bn = new BigNumber(trimmed)
  return !bn.isNaN() && bn.isPositive() && !bn.isZero()
}

/**
 * Check if amount is less than or equal to balance
 */
export function isWithinBalance(amount: string, balance: string): boolean {
  if (!isValidAmount(amount)) {
    return false
  }

  const amountBn = new BigNumber(amount.trim())
  const balanceBn = new BigNumber(balance)

  return amountBn.lte(balanceBn)
}

/**
 * Create a transfer form validation schema
 * @param maxBalance - The maximum balance available for transfer
 * @param fromAddress - The sender's address (for validating not sending to self)
 */
export function createTransferSchema(maxBalance: string, fromAddress: string) {
  return z.object({
    recipientAddress: z
      .string()
      .min(1, 'Recipient address is required')
      .refine(
        (val) => isValidGalaChainAddress(val),
        'Please enter a valid GalaChain address (e.g., client|abc123... or 0x...)'
      )
      .refine(
        (val) => val.toLowerCase() !== fromAddress.toLowerCase(),
        'Cannot transfer to yourself'
      ),
    amount: z
      .string()
      .min(1, 'Amount is required')
      .refine(
        (val) => isValidAmount(val),
        'Please enter a valid positive amount'
      )
      .refine(
        (val) => isWithinBalance(val, maxBalance),
        `Amount exceeds available balance of ${maxBalance}`
      ),
  })
}

/**
 * Type for the transfer form values
 */
export type TransferFormValues = {
  recipientAddress: string
  amount: string
}

/**
 * Default transfer form values
 */
export const defaultTransferFormValues: TransferFormValues = {
  recipientAddress: '',
  amount: '',
}

/**
 * Format an amount for display (removes trailing zeros)
 */
export function formatAmount(amount: string, decimals: number = 8): string {
  if (!amount) return '0'

  const bn = new BigNumber(amount)
  if (bn.isNaN()) return '0'

  // Format with fixed decimals then remove trailing zeros
  return bn.decimalPlaces(decimals).toFormat()
}
