/**
 * Test fixtures for creator collections (collections with mint authority)
 */
import type { CollectionDisplay } from '@shared/types/display';

/**
 * Creator collection display with additional mint authority info
 */
export interface CreatorCollectionDisplay extends CollectionDisplay {
  /** Raw mint allowance (string representation of BigNumber) */
  mintAllowanceRaw: string;
  /** Formatted mint allowance for display */
  mintAllowanceFormatted: string;
  /** Whether mint allowance is effectively unlimited */
  hasUnlimitedMint: boolean;
  /** Classes within this collection */
  classes: CreatorClassDisplay[];
  /** Whether the collection is expanded in UI */
  isExpanded: boolean;
}

/**
 * Class within a creator collection
 */
export interface CreatorClassDisplay {
  /** Unique key for the class */
  classKey: string;
  /** Collection this class belongs to */
  collection: string;
  /** Category */
  category: string;
  /** Type */
  type: string;
  /** Additional key (class identifier) */
  additionalKey: string;
  /** Class name */
  name: string;
  /** Class description */
  description: string;
  /** Class image URL */
  image: string;
  /** Max supply for this class */
  maxSupply: string;
  /** Current minted count */
  mintedCount: string;
  /** Rarity of items in this class */
  rarity?: string;
  /** Whether more items can be minted */
  canMintMore: boolean;
}

// Mock creator collections with mint authority
export const mockCreatorCollections: CreatorCollectionDisplay[] = [
  {
    collectionKey: 'MyCollection|Items||',
    collection: 'MyCollection',
    category: 'Items',
    type: '',
    additionalKey: '',
    name: 'My Collection',
    symbol: 'MYCOL',
    description: 'A test collection with mint authority',
    image: 'https://example.com/mycollection.png',
    isNonFungible: true,
    maxSupply: '10000',
    totalSupply: '234',
    totalBurned: '12',
    isAuthority: true,
    ownedCount: 50,
    mintAllowanceRaw: '1000000000',
    mintAllowanceFormatted: '1,000',
    hasUnlimitedMint: false,
    classes: [],
    isExpanded: false,
  },
  {
    collectionKey: 'UnlimitedCol|Art||',
    collection: 'UnlimitedCol',
    category: 'Art',
    type: '',
    additionalKey: '',
    name: 'Unlimited Art Collection',
    symbol: 'UART',
    description: 'A collection with unlimited mint',
    image: 'https://example.com/unlimited.png',
    isNonFungible: true,
    maxSupply: '0',
    totalSupply: '5678',
    totalBurned: '0',
    isAuthority: true,
    ownedCount: 100,
    mintAllowanceRaw: '999999999999999999',
    mintAllowanceFormatted: 'Unlimited',
    hasUnlimitedMint: true,
    classes: [],
    isExpanded: false,
  },
];

// Mock classes within collections
export const mockCreatorClasses: CreatorClassDisplay[] = [
  {
    classKey: 'MyCollection|Items|Sword|basic',
    collection: 'MyCollection',
    category: 'Items',
    type: 'Sword',
    additionalKey: 'basic',
    name: 'Basic Sword',
    description: 'A simple starter sword',
    image: 'https://example.com/basic-sword.png',
    maxSupply: '100',
    mintedCount: '45',
    rarity: 'Common',
    canMintMore: true,
  },
  {
    classKey: 'MyCollection|Items|Sword|legendary',
    collection: 'MyCollection',
    category: 'Items',
    type: 'Sword',
    additionalKey: 'legendary',
    name: 'Legendary Sword',
    description: 'A powerful legendary sword',
    image: 'https://example.com/legendary-sword.png',
    maxSupply: '10',
    mintedCount: '10',
    rarity: 'Legendary',
    canMintMore: false, // Max reached
  },
  {
    classKey: 'MyCollection|Items|Shield|basic',
    collection: 'MyCollection',
    category: 'Items',
    type: 'Shield',
    additionalKey: 'basic',
    name: 'Basic Shield',
    description: 'A simple starter shield',
    image: 'https://example.com/basic-shield.png',
    maxSupply: '0', // Unlimited
    mintedCount: '234',
    rarity: 'Common',
    canMintMore: true,
  },
];

// Single collections for simple tests
export const mockCreatorCollection: CreatorCollectionDisplay = mockCreatorCollections[0];
export const mockUnlimitedCollection: CreatorCollectionDisplay = mockCreatorCollections[1];

// Collection with classes
export const mockCollectionWithClasses: CreatorCollectionDisplay = {
  ...mockCreatorCollection,
  classes: mockCreatorClasses.filter((c) => c.collection === 'MyCollection'),
  isExpanded: true,
};

// Single classes for simple tests
export const mockBasicSwordClass: CreatorClassDisplay = mockCreatorClasses[0];
export const mockLegendarySwordClass: CreatorClassDisplay = mockCreatorClasses[1];
export const mockBasicShieldClass: CreatorClassDisplay = mockCreatorClasses[2];

// Factory functions
export function createMockCreatorCollection(
  overrides: Partial<CreatorCollectionDisplay> = {},
): CreatorCollectionDisplay {
  return {
    ...mockCreatorCollection,
    ...overrides,
  };
}

export function createMockCreatorClass(
  overrides: Partial<CreatorClassDisplay> = {},
): CreatorClassDisplay {
  return {
    ...mockBasicSwordClass,
    ...overrides,
  };
}

// Collection with no mint allowance remaining
export const mockExhaustedCollection: CreatorCollectionDisplay = {
  ...mockCreatorCollection,
  mintAllowanceRaw: '0',
  mintAllowanceFormatted: '0',
  hasUnlimitedMint: false,
};

// Collection data for form testing
export const mockCollectionFormData = {
  name: 'New Collection',
  symbol: 'NEWCOL',
  description: 'A brand new collection',
  image: 'https://example.com/new.png',
  collection: 'NewCollection',
  category: 'Items',
  type: '',
  additionalKey: '',
  isNonFungible: true,
  maxSupply: '1000',
  decimals: 0,
};

// Class form data for testing
export const mockClassFormData = {
  name: 'New Class',
  additionalKey: 'newclass',
  description: 'A new class within a collection',
  image: 'https://example.com/newclass.png',
  maxSupply: '500',
  rarity: 'Rare',
};
