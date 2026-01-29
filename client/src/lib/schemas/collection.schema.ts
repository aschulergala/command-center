import { z } from 'zod';

export const collectionSchema = z.object({
  collectionName: z
    .string()
    .min(3, 'Collection name must be at least 3 characters')
    .max(50, 'Collection name must be at most 50 characters')
    .regex(/^[a-zA-Z0-9]+$/, 'Only alphanumeric characters are allowed'),
});

export type CollectionFormData = z.infer<typeof collectionSchema>;
