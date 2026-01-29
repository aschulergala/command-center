import { z } from 'zod';

export const addressSchema = z
  .string()
  .min(1, 'Address is required')
  .refine(
    (val) => /^0x[0-9a-fA-F]{40}$/.test(val) || /^eth\|[0-9a-fA-F]{40}$/.test(val),
    'Must be a valid Ethereum (0x...) or GalaChain (eth|...) address',
  );

export const positiveNumberString = z
  .string()
  .min(1, 'Amount is required')
  .refine((val) => !isNaN(Number(val)) && Number(val) > 0, 'Must be a positive number');

export const positiveIntegerString = z
  .string()
  .min(1, 'Quantity is required')
  .refine(
    (val) => !isNaN(Number(val)) && Number(val) > 0 && Number.isInteger(Number(val)),
    'Must be a positive whole number',
  );
