import { z } from 'zod';
import { positiveNumberString } from './shared';

export const lockSchema = z.object({
  amount: positiveNumberString,
});

export type LockFormData = z.infer<typeof lockSchema>;
