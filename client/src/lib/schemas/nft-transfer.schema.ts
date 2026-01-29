import { z } from 'zod';

export const nftTransferSchema = z.object({
  recipient: z
    .string()
    .min(1, 'Recipient address is required')
    .refine(
      (val) => val.startsWith('0x') || val.startsWith('eth|'),
      'Must be a valid Ethereum or GalaChain address',
    ),
  instanceId: z
    .string()
    .min(1, 'Instance ID is required'),
});

export type NftTransferFormData = z.infer<typeof nftTransferSchema>;
