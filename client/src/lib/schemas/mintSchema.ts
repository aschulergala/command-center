/**
 * Zod validation schema for mint operations
 */

import { z } from 'zod'
import BigNumber from 'bignumber.js'

/**
 * Validates that an amount is a valid positive number
 */
export function isValidMintAmount(value: string): boolean {
  if (!value || value.trim() === '') return false

  const amount = new BigNumber(value)

  // Must be a valid finite number
  if (amount.isNaN() || !amount.isFinite()) return false

  // Must be positive (greater than zero)
  if (amount.isLessThanOrEqualTo(0)) return false

  return true
}

/**
 * Validates that amount is within the mint allowance
 */
export function isWithinMintAllowance(
  value: string,
  mintAllowance: string
): boolean {
  if (!value || value.trim() === '') return false

  const amount = new BigNumber(value)
  const allowance = new BigNumber(mintAllowance)

  // Must be valid numbers
  if (amount.isNaN() || allowance.isNaN()) return false

  // Must be within allowance
  return amount.isLessThanOrEqualTo(allowance)
}

/**
 * Create a zod schema for mint form validation
 *
 * @param mintAllowance - The remaining mint allowance for the token
 * @returns Zod schema for validating mint form
 */
export function createMintSchema(mintAllowance: string) {
  return z.object({
    amount: z
      .string()
      .min(1, 'Amount is required')
      .refine(isValidMintAmount, {
        message: 'Please enter a valid positive amount',
      })
      .refine((val) => isWithinMintAllowance(val, mintAllowance), {
        message: `Amount exceeds your mint allowance`,
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
export function formatMintAmount(amount: string, decimals: number = 8): string {
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

export type MintFormData = z.infer<ReturnType<typeof createMintSchema>>
