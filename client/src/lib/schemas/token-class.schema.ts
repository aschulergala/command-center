import { z } from 'zod';

export const tokenClassSchema = z.object({
  collection: z
    .string()
    .min(1, 'Collection is required'),
  type: z
    .string()
    .min(1, 'Type is required'),
  category: z
    .string()
    .min(1, 'Category is required'),
  name: z
    .string()
    .optional(),
  description: z
    .string()
    .optional(),
  maxSupply: z
    .string()
    .optional()
    .refine(
      (val) => !val || (!isNaN(Number(val)) && Number(val) > 0),
      'Must be a positive number',
    ),
});

export type TokenClassFormData = z.infer<typeof tokenClassSchema>;
