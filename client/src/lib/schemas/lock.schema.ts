import { z } from 'zod';

export const lockSchema = z.object({
  amount: z
    .string()
    .min(1, 'Amount is required')
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, 'Must be a positive number'),
});

export type LockFormData = z.infer<typeof lockSchema>;
