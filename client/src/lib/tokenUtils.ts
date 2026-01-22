/**
 * Token utility functions
 *
 * These utilities help with token identification and display across the app.
 */

/**
 * Represents the minimal token interface needed for identification
 */
export interface TokenIdentifiable {
  collection: string
  type: string
}

/**
 * Get the display identifier for a token.
 *
 * According to GalaChain conventions:
 * - If the collection is NOT 'Token', use the collection name as the identifier
 * - If the collection IS 'Token', use the type field as the identifier
 *
 * This is because most tokens use 'Token' as a generic collection name,
 * and the meaningful identifier is in the type field. However, some tokens
 * use custom collection names that are more descriptive.
 *
 * @param token - Token object with collection and type fields
 * @returns The appropriate identifier string for display
 *
 * @example
 * // Custom collection - returns collection name
 * getTokenIdentifier({ collection: 'GALA', type: 'GALA' }) // returns 'GALA'
 *
 * @example
 * // Default 'Token' collection - returns type name
 * getTokenIdentifier({ collection: 'Token', type: 'MyCustomToken' }) // returns 'MyCustomToken'
 */
export function getTokenIdentifier(token: TokenIdentifiable): string {
  // If collection is not the default 'Token', use collection as the identifier
  if (token.collection !== 'Token') {
    return token.collection
  }
  // Otherwise, use the type field
  return token.type
}
