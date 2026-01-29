import { z } from 'zod';

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
  quantity: z
    .string()
    .min(1, 'Quantity is required')
    .refine(
      (val) => !isNaN(Number(val)) && Number(val) > 0 && Number.isInteger(Number(val)),
      'Must be a positive whole number',
    ),
  ownerAddress: z
    .string()
    .min(1, 'Owner address is required'),
});

export type NftMintFormData = z.infer<typeof nftMintSchema>;
