/**
 * Validation schema for creating token classes within a collection
 */
import { z } from 'zod'
import { toTypedSchema } from '@vee-validate/zod'

/**
 * Validate a class name (alphanumeric with some special chars)
 */
export function isValidClassName(value: string): boolean {
  if (!value || typeof value !== 'string') return false
  // Allow alphanumeric, spaces, hyphens, underscores
  return /^[a-zA-Z0-9\s\-_]+$/.test(value.trim()) && value.trim().length > 0
}

/**
 * Validate a class identifier (alphanumeric, used in additionalKey)
 */
export function isValidClassIdentifier(value: string): boolean {
  if (!value || typeof value !== 'string') return false
  // Only alphanumeric, no spaces
  return /^[a-zA-Z0-9]+$/.test(value)
}

/**
 * Validate max supply (positive integer or empty for unlimited)
 */
export function isValidMaxSupply(value: string): boolean {
  if (!value || value === '') return true // Empty = unlimited
  const trimmed = value.trim()
  // Must be a valid positive integer
  if (!/^\d+$/.test(trimmed)) return false
  const num = parseInt(trimmed, 10)
  return !isNaN(num) && num > 0 && num.toString() === trimmed
}

/**
 * Validate image URL (optional, must be valid HTTP/HTTPS URL if provided)
 */
export function isValidImageUrl(value: string): boolean {
  if (!value || value === '') return true // Optional
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

/**
 * Create class form values
 */
export interface CreateClassFormValues {
  name: string
  additionalKey: string
  description: string
  image: string
  maxSupply: string
  rarity: string
}

/**
 * Zod schema for create class form
 */
export const createClassSchema = z.object({
  name: z
    .string()
    .min(1, 'Class name is required')
    .max(100, 'Class name must be 100 characters or less')
    .refine(isValidClassName, 'Class name can only contain letters, numbers, spaces, hyphens, and underscores'),

  additionalKey: z
    .string()
    .min(1, 'Class identifier is required')
    .max(50, 'Class identifier must be 50 characters or less')
    .refine(isValidClassIdentifier, 'Class identifier can only contain letters and numbers (no spaces)'),

  description: z
    .string()
    .max(1000, 'Description must be 1000 characters or less')
    .optional()
    .default(''),

  image: z
    .string()
    .refine(isValidImageUrl, 'Must be a valid HTTP or HTTPS URL')
    .optional()
    .default(''),

  maxSupply: z
    .string()
    .refine(isValidMaxSupply, 'Max supply must be a positive integer (leave empty for unlimited)')
    .optional()
    .default(''),

  rarity: z
    .string()
    .max(50, 'Rarity must be 50 characters or less')
    .optional()
    .default(''),
})

/**
 * Get the typed schema for VeeValidate
 */
export function getCreateClassTypedSchema() {
  return toTypedSchema(createClassSchema)
}

/**
 * Format max supply for display
 */
export function formatMaxSupply(value: string | undefined): string {
  if (!value || value === '' || value === '0') return 'Unlimited'
  return parseInt(value, 10).toLocaleString()
}

/**
 * Generate class key from collection and additionalKey
 */
export function generateClassKey(
  collection: string,
  category: string,
  type: string,
  additionalKey: string
): string {
  return `${collection}|${category}|${type}|${additionalKey}`
}
