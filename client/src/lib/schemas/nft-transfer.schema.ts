import { z } from 'zod';
import { addressSchema } from './shared';

export const nftTransferSchema = z.object({
  recipient: addressSchema,
  instanceId: z
    .string()
    .min(1, 'Instance ID is required'),
});

export type NftTransferFormData = z.infer<typeof nftTransferSchema>;
