import { z } from 'zod';
import { addressSchema, positiveNumberString } from './shared';

export const transferSchema = z.object({
  recipient: addressSchema,
  amount: positiveNumberString,
});

export type TransferFormData = z.infer<typeof transferSchema>;
