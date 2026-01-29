import { z } from 'zod';
import { addressSchema, positiveIntegerString } from './shared';

export const nftMintSchema = z.object({
  collection: z
    .string()
    .min(1, 'Collection is required'),
  type: z
    .string()
    .min(1, 'Type is required'),
  category: z
    .string()
    .min(1, 'Category is required'),
  quantity: positiveIntegerString,
  ownerAddress: addressSchema,
});

export type NftMintFormData = z.infer<typeof nftMintSchema>;
