import { z } from 'zod';
import { addressSchema, positiveNumberString } from './shared';

export const collectionMintSchema = z.object({
  quantity: positiveNumberString,
  ownerAddress: addressSchema,
});

export type CollectionMintFormData = z.infer<typeof collectionMintSchema>;
