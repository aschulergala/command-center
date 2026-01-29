import { z } from 'zod';

export const collectionMintSchema = z.object({
  quantity: z
    .string()
    .min(1, 'Quantity is required')
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, 'Must be a positive number'),
  ownerAddress: z
    .string()
    .min(1, 'Owner address is required')
    .refine(
      (val) => val.startsWith('0x') || val.startsWith('eth|'),
      'Must be a valid Ethereum or GalaChain address',
    ),
});

export type CollectionMintFormData = z.infer<typeof collectionMintSchema>;
