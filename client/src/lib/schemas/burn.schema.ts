import { z } from 'zod';
import { positiveNumberString } from './shared';

export const burnSchema = z.object({
  amount: positiveNumberString,
  confirmText: z
    .string()
    .refine((val) => val === 'BURN', 'Type BURN to confirm'),
});

export type BurnFormData = z.infer<typeof burnSchema>;
