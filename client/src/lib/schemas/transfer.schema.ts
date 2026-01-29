import { z } from 'zod';

export const transferSchema = z.object({
  recipient: z
    .string()
    .min(1, 'Recipient address is required')
    .refine(
      (val) => val.startsWith('0x') || val.startsWith('eth|'),
      'Must be a valid Ethereum or GalaChain address',
    ),
  amount: z
    .string()
    .min(1, 'Amount is required')
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, 'Must be a positive number'),
});

export type TransferFormData = z.infer<typeof transferSchema>;
