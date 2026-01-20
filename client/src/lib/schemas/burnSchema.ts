/**
 * Zod validation schema for burn operations
 */

import { z } from 'zod'
import BigNumber from 'bignumber.js'

/**
 * Validates that an amount is a valid positive number
 */
export function isValidBurnAmount(value: string): boolean {
  if (!value || value.trim() === '') return false

  const amount = new BigNumber(value)

  // Must be a valid finite number
  if (amount.isNaN() || !amount.isFinite()) return false

  // Must be positive (greater than zero)
  if (amount.isLessThanOrEqualTo(0)) return false

  return true
}

/**
 * Validates that amount is within the token balance
 */
export function isWithinBalance(
  value: string,
  balance: string
): boolean {
  if (!value || value.trim() === '') return false

  const amount = new BigNumber(value)
  const balanceAmount = new BigNumber(balance)

  // Must be valid numbers
  if (amount.isNaN() || balanceAmount.isNaN()) return false

  // Must be within balance
  return amount.isLessThanOrEqualTo(balanceAmount)
}

/**
 * Create a zod schema for burn form validation
 *
 * @param balance - The token balance available to burn
 * @returns Zod schema for validating burn form
 */
export function createBurnSchema(balance: string) {
  return z.object({
    amount: z
      .string()
      .min(1, 'Amount is required')
      .refine(isValidBurnAmount, {
        message: 'Please enter a valid positive amount',
      })
      .refine((val) => isWithinBalance(val, balance), {
        message: 'Amount exceeds your available balance',
      }),
    confirmation: z
      .boolean()
      .refine((val) => val === true, {
        message: 'You must confirm that you understand this action is irreversible',
      }),
  })
}

/**
 * Format amount for display with proper decimals
 *
 * @param amount - Raw amount string
 * @param decimals - Number of decimal places
 * @returns Formatted amount string
 */
export function formatBurnAmount(amount: string, decimals: number = 8): string {
  if (!amount || amount.trim() === '') return '0'

  const value = new BigNumber(amount)
  if (value.isNaN()) return '0'

  // Return '0' for zero values
  if (value.isZero()) return '0'

  // Divide by 10^decimals to get the display value
  const displayValue = value.dividedBy(new BigNumber(10).pow(decimals))

  // Format with thousands separators
  if (displayValue.isGreaterThanOrEqualTo(1000)) {
    return displayValue.toFormat(2)
  }

  // For smaller numbers, show more precision
  if (displayValue.isLessThan(0.0001) && !displayValue.isZero()) {
    return displayValue.toExponential(2)
  }

  return displayValue.toFormat(4)
}

export type BurnFormData = z.infer<ReturnType<typeof createBurnSchema>>
