import { z } from 'zod';

export const burnSchema = z.object({
  amount: z
    .string()
    .min(1, 'Amount is required')
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, 'Must be a positive number'),
  confirmText: z
    .string()
    .refine((val) => val === 'BURN', 'Type BURN to confirm'),
});

export type BurnFormData = z.infer<typeof burnSchema>;
