/**
 * Zod schema and validation functions for creating token collections
 */

import { z } from 'zod'
import { toTypedSchema } from '@vee-validate/zod'

/**
 * Valid identifier pattern for GalaChain collection keys
 * Allows alphanumeric characters, hyphens, and underscores
 */
const IDENTIFIER_PATTERN = /^[a-zA-Z0-9_-]+$/

/**
 * Collection key constraints
 */
const MIN_KEY_LENGTH = 1
const MAX_KEY_LENGTH = 64

/**
 * Name/symbol constraints
 */
const MIN_NAME_LENGTH = 1
const MAX_NAME_LENGTH = 100
const MIN_SYMBOL_LENGTH = 1
const MAX_SYMBOL_LENGTH = 10

/**
 * Description constraints
 */
const MAX_DESCRIPTION_LENGTH = 1000

/**
 * Validate an identifier (collection, category, type, additionalKey)
 */
export function isValidIdentifier(value: string): boolean {
  if (!value || value.length < MIN_KEY_LENGTH || value.length > MAX_KEY_LENGTH) {
    return false
  }
  return IDENTIFIER_PATTERN.test(value)
}

/**
 * Validate a URL (must be valid HTTP/HTTPS URL)
 */
export function isValidImageUrl(value: string): boolean {
  if (!value) return false
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

/**
 * Validate max supply (must be positive integer or 0 for unlimited)
 */
export function isValidMaxSupply(value: string | number): boolean {
  if (value === '' || value === undefined) return true // Optional, unlimited
  const strValue = String(value).trim()
  // Check if the string contains only digits
  if (typeof value === 'string' && !/^\d+$/.test(strValue)) return false
  const num = typeof value === 'string' ? parseFloat(value) : value
  if (isNaN(num)) return false
  if (num < 0) return false
  if (!Number.isInteger(num)) return false
  return true
}

/**
 * Zod schema for collection identifier fields
 */
const identifierSchema = z
  .string()
  .min(MIN_KEY_LENGTH, `Must be at least ${MIN_KEY_LENGTH} character`)
  .max(MAX_KEY_LENGTH, `Must be at most ${MAX_KEY_LENGTH} characters`)
  .regex(IDENTIFIER_PATTERN, 'Only letters, numbers, hyphens, and underscores allowed')

/**
 * Zod schema for creating a new collection
 */
export const createCollectionSchema = z.object({
  // Token class key fields
  collection: identifierSchema,
  category: identifierSchema,
  type: identifierSchema,
  additionalKey: z
    .string()
    .max(MAX_KEY_LENGTH, `Must be at most ${MAX_KEY_LENGTH} characters`)
    .regex(/^[a-zA-Z0-9_-]*$/, 'Only letters, numbers, hyphens, and underscores allowed')
    .default('none'),

  // Display information
  name: z
    .string()
    .min(MIN_NAME_LENGTH, `Name is required`)
    .max(MAX_NAME_LENGTH, `Name must be at most ${MAX_NAME_LENGTH} characters`),
  symbol: z
    .string()
    .min(MIN_SYMBOL_LENGTH, `Symbol is required`)
    .max(MAX_SYMBOL_LENGTH, `Symbol must be at most ${MAX_SYMBOL_LENGTH} characters`)
    .toUpperCase(),
  description: z
    .string()
    .max(MAX_DESCRIPTION_LENGTH, `Description must be at most ${MAX_DESCRIPTION_LENGTH} characters`)
    .default(''),
  image: z
    .string()
    .url('Must be a valid URL')
    .refine(
      (val) => {
        try {
          const url = new URL(val)
          return url.protocol === 'http:' || url.protocol === 'https:'
        } catch {
          return false
        }
      },
      { message: 'Must be an HTTP or HTTPS URL' }
    ),

  // Token configuration
  isNonFungible: z.boolean().default(true),
  decimals: z
    .number()
    .int('Decimals must be a whole number')
    .min(0, 'Decimals cannot be negative')
    .max(18, 'Decimals cannot exceed 18')
    .default(0),
  maxSupply: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val || val === '') return true // Empty = unlimited
        const num = parseFloat(val)
        return !isNaN(num) && num >= 0 && Number.isInteger(num)
      },
      { message: 'Max supply must be a positive whole number or empty for unlimited' }
    ),
})

/**
 * Type for the form values
 */
export type CreateCollectionFormValues = z.infer<typeof createCollectionSchema>

/**
 * Typed schema for VeeValidate
 */
export function getCreateCollectionTypedSchema() {
  return toTypedSchema(createCollectionSchema)
}

/**
 * Default form values
 */
export const defaultCollectionFormValues: Partial<CreateCollectionFormValues> = {
  collection: '',
  category: 'Item',
  type: '',
  additionalKey: 'none',
  name: '',
  symbol: '',
  description: '',
  image: '',
  isNonFungible: true,
  decimals: 0,
  maxSupply: '',
}

/**
 * Format max supply for display
 */
export function formatMaxSupply(value: string | number | undefined): string {
  if (value === undefined || value === '' || value === '0' || value === 0) {
    return 'Unlimited'
  }
  const num = typeof value === 'string' ? parseInt(value, 10) : value
  return num.toLocaleString()
}
