/**
 * Zod validation schemas for NFT transfer operations
 *
 * NFT transfers are always quantity 1, so validation is simpler than fungible token transfers.
 */

import { z } from 'zod'
import { isValidGalaChainAddress } from './transferSchema'

// Re-export address validation for consistency
export { isValidGalaChainAddress }

/**
 * Create an NFT transfer form validation schema
 * @param fromAddress - The sender's address (for validating not sending to self)
 */
export function createTransferNFTSchema(fromAddress: string) {
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
  })
}

/**
 * Type for the NFT transfer form values
 */
export type TransferNFTFormValues = {
  recipientAddress: string
}

/**
 * Default NFT transfer form values
 */
export const defaultTransferNFTFormValues: TransferNFTFormValues = {
  recipientAddress: '',
}

/**
 * Truncate an address for display
 * @param address - The full address
 * @param startChars - Number of characters to show at start
 * @param endChars - Number of characters to show at end
 */
export function truncateAddress(address: string, startChars: number = 12, endChars: number = 8): string {
  if (!address) return ''
  if (address.length <= startChars + endChars) return address
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`
}

/**
 * Truncate an instance ID for display
 * @param instanceId - The full instance ID
 */
export function truncateInstanceId(instanceId: string, maxLength: number = 8): string {
  if (!instanceId) return ''
  if (instanceId.length <= maxLength) return instanceId
  const half = Math.floor(maxLength / 2)
  return `${instanceId.slice(0, half)}...${instanceId.slice(-half)}`
}
