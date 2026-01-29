import { describe, it, expect } from 'vitest';
import { transferSchema } from '@/lib/schemas/transfer.schema';
import { burnSchema } from '@/lib/schemas/burn.schema';
import { lockSchema } from '@/lib/schemas/lock.schema';
import { nftTransferSchema } from '@/lib/schemas/nft-transfer.schema';
import { nftMintSchema } from '@/lib/schemas/nft-mint.schema';
import { collectionSchema } from '@/lib/schemas/collection.schema';
import { tokenClassSchema } from '@/lib/schemas/token-class.schema';
import { collectionMintSchema } from '@/lib/schemas/collection-mint.schema';

// ---------------------------------------------------------------------------
// Helper: extract flat array of error messages from a ZodError
// ---------------------------------------------------------------------------
function getErrors(result: { success: boolean; error?: { issues: { message: string }[] } }): string[] {
  if (result.success) return [];
  return result.error!.issues.map((i) => i.message);
}

// Valid test addresses (40 hex chars after prefix)
const VALID_0X = '0x1234567890abcdef1234567890abcdef12345678';
const VALID_ETH = 'eth|1234567890abcdef1234567890abcdef12345678';

// ===========================================================================
// transferSchema
// ===========================================================================
describe('transferSchema', () => {
  it('accepts valid input with 0x address', () => {
    const result = transferSchema.safeParse({ recipient: VALID_0X, amount: '10' });
    expect(result.success).toBe(true);
  });

  it('accepts valid input with eth| address', () => {
    const result = transferSchema.safeParse({ recipient: VALID_ETH, amount: '0.5' });
    expect(result.success).toBe(true);
  });

  it('rejects empty recipient', () => {
    const result = transferSchema.safeParse({ recipient: '', amount: '10' });
    expect(result.success).toBe(false);
    expect(getErrors(result)).toContain('Address is required');
  });

  it('rejects recipient without valid prefix', () => {
    const result = transferSchema.safeParse({ recipient: 'abc123', amount: '10' });
    expect(result.success).toBe(false);
    expect(getErrors(result)).toContain('Must be a valid Ethereum (0x...) or GalaChain (eth|...) address');
  });

  it('rejects 0x address with wrong length', () => {
    const result = transferSchema.safeParse({ recipient: '0xabc123', amount: '10' });
    expect(result.success).toBe(false);
    expect(getErrors(result)).toContain('Must be a valid Ethereum (0x...) or GalaChain (eth|...) address');
  });

  it('rejects missing recipient field entirely', () => {
    const result = transferSchema.safeParse({ amount: '10' });
    expect(result.success).toBe(false);
  });

  it('rejects empty amount', () => {
    const result = transferSchema.safeParse({ recipient: VALID_0X, amount: '' });
    expect(result.success).toBe(false);
    expect(getErrors(result)).toContain('Amount is required');
  });

  it('rejects non-numeric amount', () => {
    const result = transferSchema.safeParse({ recipient: VALID_0X, amount: 'notanumber' });
    expect(result.success).toBe(false);
    expect(getErrors(result)).toContain('Must be a positive number');
  });

  it('rejects zero amount', () => {
    const result = transferSchema.safeParse({ recipient: VALID_0X, amount: '0' });
    expect(result.success).toBe(false);
    expect(getErrors(result)).toContain('Must be a positive number');
  });

  it('rejects negative amount', () => {
    const result = transferSchema.safeParse({ recipient: VALID_0X, amount: '-5' });
    expect(result.success).toBe(false);
    expect(getErrors(result)).toContain('Must be a positive number');
  });

  it('rejects missing amount field entirely', () => {
    const result = transferSchema.safeParse({ recipient: VALID_0X });
    expect(result.success).toBe(false);
  });

  it('rejects completely empty object', () => {
    const result = transferSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it('accepts large decimal amounts', () => {
    const result = transferSchema.safeParse({ recipient: VALID_0X, amount: '999999999.123456789' });
    expect(result.success).toBe(true);
  });
});

// ===========================================================================
// burnSchema
// ===========================================================================
describe('burnSchema', () => {
  it('accepts valid input', () => {
    const result = burnSchema.safeParse({ amount: '100', confirmText: 'BURN' });
    expect(result.success).toBe(true);
  });

  it('rejects empty amount', () => {
    const result = burnSchema.safeParse({ amount: '', confirmText: 'BURN' });
    expect(result.success).toBe(false);
    expect(getErrors(result)).toContain('Amount is required');
  });

  it('rejects non-numeric amount', () => {
    const result = burnSchema.safeParse({ amount: 'abc', confirmText: 'BURN' });
    expect(result.success).toBe(false);
    expect(getErrors(result)).toContain('Must be a positive number');
  });

  it('rejects zero amount', () => {
    const result = burnSchema.safeParse({ amount: '0', confirmText: 'BURN' });
    expect(result.success).toBe(false);
    expect(getErrors(result)).toContain('Must be a positive number');
  });

  it('rejects negative amount', () => {
    const result = burnSchema.safeParse({ amount: '-1', confirmText: 'BURN' });
    expect(result.success).toBe(false);
    expect(getErrors(result)).toContain('Must be a positive number');
  });

  it('rejects wrong confirmText', () => {
    const result = burnSchema.safeParse({ amount: '10', confirmText: 'burn' });
    expect(result.success).toBe(false);
    expect(getErrors(result)).toContain('Type BURN to confirm');
  });

  it('rejects empty confirmText', () => {
    const result = burnSchema.safeParse({ amount: '10', confirmText: '' });
    expect(result.success).toBe(false);
    expect(getErrors(result)).toContain('Type BURN to confirm');
  });

  it('rejects confirmText with extra characters', () => {
    const result = burnSchema.safeParse({ amount: '10', confirmText: 'BURN!' });
    expect(result.success).toBe(false);
    expect(getErrors(result)).toContain('Type BURN to confirm');
  });

  it('rejects missing both fields', () => {
    const result = burnSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it('accepts decimal amounts', () => {
    const result = burnSchema.safeParse({ amount: '0.001', confirmText: 'BURN' });
    expect(result.success).toBe(true);
  });
});

// ===========================================================================
// lockSchema
// ===========================================================================
describe('lockSchema', () => {
  it('accepts valid amount', () => {
    const result = lockSchema.safeParse({ amount: '50' });
    expect(result.success).toBe(true);
  });

  it('accepts decimal amount', () => {
    const result = lockSchema.safeParse({ amount: '0.1' });
    expect(result.success).toBe(true);
  });

  it('rejects empty amount', () => {
    const result = lockSchema.safeParse({ amount: '' });
    expect(result.success).toBe(false);
    expect(getErrors(result)).toContain('Amount is required');
  });

  it('rejects non-numeric amount', () => {
    const result = lockSchema.safeParse({ amount: 'xyz' });
    expect(result.success).toBe(false);
    expect(getErrors(result)).toContain('Must be a positive number');
  });

  it('rejects zero amount', () => {
    const result = lockSchema.safeParse({ amount: '0' });
    expect(result.success).toBe(false);
    expect(getErrors(result)).toContain('Must be a positive number');
  });

  it('rejects negative amount', () => {
    const result = lockSchema.safeParse({ amount: '-10' });
    expect(result.success).toBe(false);
    expect(getErrors(result)).toContain('Must be a positive number');
  });

  it('rejects missing amount field', () => {
    const result = lockSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

// ===========================================================================
// nftTransferSchema
// ===========================================================================
describe('nftTransferSchema', () => {
  it('accepts valid input with 0x address', () => {
    const result = nftTransferSchema.safeParse({ recipient: VALID_0X, instanceId: 'nft-1' });
    expect(result.success).toBe(true);
  });

  it('accepts valid input with eth| address', () => {
    const result = nftTransferSchema.safeParse({ recipient: VALID_ETH, instanceId: 'nft-1' });
    expect(result.success).toBe(true);
  });

  it('rejects empty recipient', () => {
    const result = nftTransferSchema.safeParse({ recipient: '', instanceId: 'nft-1' });
    expect(result.success).toBe(false);
    expect(getErrors(result)).toContain('Address is required');
  });

  it('rejects recipient with invalid prefix', () => {
    const result = nftTransferSchema.safeParse({ recipient: 'invalid-addr', instanceId: 'nft-1' });
    expect(result.success).toBe(false);
    expect(getErrors(result)).toContain('Must be a valid Ethereum (0x...) or GalaChain (eth|...) address');
  });

  it('rejects 0x address with wrong length', () => {
    const result = nftTransferSchema.safeParse({ recipient: '0xabc', instanceId: 'nft-1' });
    expect(result.success).toBe(false);
    expect(getErrors(result)).toContain('Must be a valid Ethereum (0x...) or GalaChain (eth|...) address');
  });

  it('rejects empty instanceId', () => {
    const result = nftTransferSchema.safeParse({ recipient: VALID_0X, instanceId: '' });
    expect(result.success).toBe(false);
    expect(getErrors(result)).toContain('Instance ID is required');
  });

  it('rejects missing instanceId field', () => {
    const result = nftTransferSchema.safeParse({ recipient: VALID_0X });
    expect(result.success).toBe(false);
  });

  it('rejects missing recipient field', () => {
    const result = nftTransferSchema.safeParse({ instanceId: 'nft-1' });
    expect(result.success).toBe(false);
  });

  it('rejects empty object', () => {
    const result = nftTransferSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it('accepts any non-empty string as instanceId', () => {
    const result = nftTransferSchema.safeParse({ recipient: VALID_0X, instanceId: '12345' });
    expect(result.success).toBe(true);
  });
});

// ===========================================================================
// nftMintSchema
// ===========================================================================
describe('nftMintSchema', () => {
  const validInput = {
    collection: 'MyCollection',
    type: 'Art',
    category: 'Digital',
    quantity: '5',
    ownerAddress: VALID_ETH,
  };

  it('accepts valid input', () => {
    const result = nftMintSchema.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  it('accepts valid input with 0x ownerAddress', () => {
    const result = nftMintSchema.safeParse({ ...validInput, ownerAddress: VALID_0X });
    expect(result.success).toBe(true);
  });

  it('rejects empty collection', () => {
    const result = nftMintSchema.safeParse({ ...validInput, collection: '' });
    expect(result.success).toBe(false);
    expect(getErrors(result)).toContain('Collection is required');
  });

  it('rejects empty type', () => {
    const result = nftMintSchema.safeParse({ ...validInput, type: '' });
    expect(result.success).toBe(false);
    expect(getErrors(result)).toContain('Type is required');
  });

  it('rejects empty category', () => {
    const result = nftMintSchema.safeParse({ ...validInput, category: '' });
    expect(result.success).toBe(false);
    expect(getErrors(result)).toContain('Category is required');
  });

  it('rejects empty quantity', () => {
    const result = nftMintSchema.safeParse({ ...validInput, quantity: '' });
    expect(result.success).toBe(false);
    expect(getErrors(result)).toContain('Quantity is required');
  });

  it('rejects non-numeric quantity', () => {
    const result = nftMintSchema.safeParse({ ...validInput, quantity: 'abc' });
    expect(result.success).toBe(false);
    expect(getErrors(result)).toContain('Must be a positive whole number');
  });

  it('rejects zero quantity', () => {
    const result = nftMintSchema.safeParse({ ...validInput, quantity: '0' });
    expect(result.success).toBe(false);
    expect(getErrors(result)).toContain('Must be a positive whole number');
  });

  it('rejects negative quantity', () => {
    const result = nftMintSchema.safeParse({ ...validInput, quantity: '-3' });
    expect(result.success).toBe(false);
    expect(getErrors(result)).toContain('Must be a positive whole number');
  });

  it('rejects decimal quantity', () => {
    const result = nftMintSchema.safeParse({ ...validInput, quantity: '2.5' });
    expect(result.success).toBe(false);
    expect(getErrors(result)).toContain('Must be a positive whole number');
  });

  it('accepts quantity of 1', () => {
    const result = nftMintSchema.safeParse({ ...validInput, quantity: '1' });
    expect(result.success).toBe(true);
  });

  it('rejects empty ownerAddress', () => {
    const result = nftMintSchema.safeParse({ ...validInput, ownerAddress: '' });
    expect(result.success).toBe(false);
    expect(getErrors(result)).toContain('Address is required');
  });

  it('rejects ownerAddress with invalid prefix', () => {
    const result = nftMintSchema.safeParse({ ...validInput, ownerAddress: 'client|abcdef' });
    expect(result.success).toBe(false);
    expect(getErrors(result)).toContain('Must be a valid Ethereum (0x...) or GalaChain (eth|...) address');
  });

  it('rejects empty object', () => {
    const result = nftMintSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it('accepts large whole number quantity', () => {
    const result = nftMintSchema.safeParse({ ...validInput, quantity: '1000000' });
    expect(result.success).toBe(true);
  });
});

// ===========================================================================
// collectionSchema
// ===========================================================================
describe('collectionSchema', () => {
  it('accepts valid alphanumeric name', () => {
    const result = collectionSchema.safeParse({ collectionName: 'MyCollection1' });
    expect(result.success).toBe(true);
  });

  it('accepts name at minimum length (3 chars)', () => {
    const result = collectionSchema.safeParse({ collectionName: 'abc' });
    expect(result.success).toBe(true);
  });

  it('accepts name at maximum length (50 chars)', () => {
    const result = collectionSchema.safeParse({ collectionName: 'a'.repeat(50) });
    expect(result.success).toBe(true);
  });

  it('rejects name shorter than 3 characters', () => {
    const result = collectionSchema.safeParse({ collectionName: 'ab' });
    expect(result.success).toBe(false);
    expect(getErrors(result)).toContain('Collection name must be at least 3 characters');
  });

  it('rejects single character name', () => {
    const result = collectionSchema.safeParse({ collectionName: 'a' });
    expect(result.success).toBe(false);
    expect(getErrors(result)).toContain('Collection name must be at least 3 characters');
  });

  it('rejects empty name', () => {
    const result = collectionSchema.safeParse({ collectionName: '' });
    expect(result.success).toBe(false);
  });

  it('rejects name longer than 50 characters', () => {
    const result = collectionSchema.safeParse({ collectionName: 'a'.repeat(51) });
    expect(result.success).toBe(false);
    expect(getErrors(result)).toContain('Collection name must be at most 50 characters');
  });

  it('rejects name with spaces', () => {
    const result = collectionSchema.safeParse({ collectionName: 'My Collection' });
    expect(result.success).toBe(false);
    expect(getErrors(result)).toContain('Only alphanumeric characters are allowed');
  });

  it('rejects name with hyphens', () => {
    const result = collectionSchema.safeParse({ collectionName: 'my-collection' });
    expect(result.success).toBe(false);
    expect(getErrors(result)).toContain('Only alphanumeric characters are allowed');
  });

  it('rejects name with underscores', () => {
    const result = collectionSchema.safeParse({ collectionName: 'my_collection' });
    expect(result.success).toBe(false);
    expect(getErrors(result)).toContain('Only alphanumeric characters are allowed');
  });

  it('rejects name with special characters', () => {
    const result = collectionSchema.safeParse({ collectionName: 'abc!@#' });
    expect(result.success).toBe(false);
    expect(getErrors(result)).toContain('Only alphanumeric characters are allowed');
  });

  it('rejects missing collectionName field', () => {
    const result = collectionSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it('accepts all-numeric name (3+ chars)', () => {
    const result = collectionSchema.safeParse({ collectionName: '123' });
    expect(result.success).toBe(true);
  });

  it('accepts mixed case alphanumeric', () => {
    const result = collectionSchema.safeParse({ collectionName: 'AbCdEf123' });
    expect(result.success).toBe(true);
  });
});

// ===========================================================================
// tokenClassSchema
// ===========================================================================
describe('tokenClassSchema', () => {
  const validInput = {
    collection: 'MyCollection',
    type: 'Weapon',
    category: 'Sword',
  };

  it('accepts valid input with required fields only', () => {
    const result = tokenClassSchema.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  it('accepts valid input with all optional fields', () => {
    const result = tokenClassSchema.safeParse({
      ...validInput,
      name: 'Excalibur',
      description: 'A legendary sword',
      maxSupply: '1000',
    });
    expect(result.success).toBe(true);
  });

  it('accepts when name is omitted', () => {
    const result = tokenClassSchema.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  it('accepts when description is omitted', () => {
    const result = tokenClassSchema.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  it('accepts when maxSupply is omitted', () => {
    const result = tokenClassSchema.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  it('rejects empty collection', () => {
    const result = tokenClassSchema.safeParse({ ...validInput, collection: '' });
    expect(result.success).toBe(false);
    expect(getErrors(result)).toContain('Collection is required');
  });

  it('rejects empty type', () => {
    const result = tokenClassSchema.safeParse({ ...validInput, type: '' });
    expect(result.success).toBe(false);
    expect(getErrors(result)).toContain('Type is required');
  });

  it('rejects empty category', () => {
    const result = tokenClassSchema.safeParse({ ...validInput, category: '' });
    expect(result.success).toBe(false);
    expect(getErrors(result)).toContain('Category is required');
  });

  it('rejects non-numeric maxSupply', () => {
    const result = tokenClassSchema.safeParse({ ...validInput, maxSupply: 'abc' });
    expect(result.success).toBe(false);
    expect(getErrors(result)).toContain('Must be a positive number');
  });

  it('rejects zero maxSupply', () => {
    const result = tokenClassSchema.safeParse({ ...validInput, maxSupply: '0' });
    expect(result.success).toBe(false);
    expect(getErrors(result)).toContain('Must be a positive number');
  });

  it('rejects negative maxSupply', () => {
    const result = tokenClassSchema.safeParse({ ...validInput, maxSupply: '-10' });
    expect(result.success).toBe(false);
    expect(getErrors(result)).toContain('Must be a positive number');
  });

  it('accepts decimal maxSupply', () => {
    const result = tokenClassSchema.safeParse({ ...validInput, maxSupply: '5.5' });
    expect(result.success).toBe(true);
  });

  it('accepts empty string maxSupply (treated as falsy by refine)', () => {
    // empty string is falsy in the refine check: !val evaluates to true, so the refine passes
    const result = tokenClassSchema.safeParse({ ...validInput, maxSupply: '' });
    expect(result.success).toBe(true);
  });

  it('rejects empty object', () => {
    const result = tokenClassSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it('accepts name as empty string (valid for optional string)', () => {
    const result = tokenClassSchema.safeParse({ ...validInput, name: '' });
    expect(result.success).toBe(true);
  });
});

// ===========================================================================
// collectionMintSchema
// ===========================================================================
describe('collectionMintSchema', () => {
  it('accepts valid input with 0x address', () => {
    const result = collectionMintSchema.safeParse({ quantity: '10', ownerAddress: VALID_0X });
    expect(result.success).toBe(true);
  });

  it('accepts valid input with eth| address', () => {
    const result = collectionMintSchema.safeParse({ quantity: '1', ownerAddress: VALID_ETH });
    expect(result.success).toBe(true);
  });

  it('rejects empty quantity', () => {
    const result = collectionMintSchema.safeParse({ quantity: '', ownerAddress: VALID_0X });
    expect(result.success).toBe(false);
    expect(getErrors(result)).toContain('Amount is required');
  });

  it('rejects non-numeric quantity', () => {
    const result = collectionMintSchema.safeParse({ quantity: 'abc', ownerAddress: VALID_0X });
    expect(result.success).toBe(false);
    expect(getErrors(result)).toContain('Must be a positive number');
  });

  it('rejects zero quantity', () => {
    const result = collectionMintSchema.safeParse({ quantity: '0', ownerAddress: VALID_0X });
    expect(result.success).toBe(false);
    expect(getErrors(result)).toContain('Must be a positive number');
  });

  it('rejects negative quantity', () => {
    const result = collectionMintSchema.safeParse({ quantity: '-5', ownerAddress: VALID_0X });
    expect(result.success).toBe(false);
    expect(getErrors(result)).toContain('Must be a positive number');
  });

  it('accepts decimal quantity (schema does not enforce integer)', () => {
    const result = collectionMintSchema.safeParse({ quantity: '2.5', ownerAddress: VALID_0X });
    expect(result.success).toBe(true);
  });

  it('rejects empty ownerAddress', () => {
    const result = collectionMintSchema.safeParse({ quantity: '10', ownerAddress: '' });
    expect(result.success).toBe(false);
    expect(getErrors(result)).toContain('Address is required');
  });

  it('rejects ownerAddress with invalid prefix', () => {
    const result = collectionMintSchema.safeParse({ quantity: '10', ownerAddress: 'invalid-addr' });
    expect(result.success).toBe(false);
    expect(getErrors(result)).toContain('Must be a valid Ethereum (0x...) or GalaChain (eth|...) address');
  });

  it('rejects ownerAddress with wrong length', () => {
    const result = collectionMintSchema.safeParse({ quantity: '10', ownerAddress: '0xabc' });
    expect(result.success).toBe(false);
    expect(getErrors(result)).toContain('Must be a valid Ethereum (0x...) or GalaChain (eth|...) address');
  });

  it('rejects missing both fields', () => {
    const result = collectionMintSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it('rejects missing ownerAddress field', () => {
    const result = collectionMintSchema.safeParse({ quantity: '10' });
    expect(result.success).toBe(false);
  });

  it('rejects missing quantity field', () => {
    const result = collectionMintSchema.safeParse({ ownerAddress: VALID_0X });
    expect(result.success).toBe(false);
  });
});
