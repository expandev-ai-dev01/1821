/**
 * @summary
 * Zod validation utilities.
 * Provides reusable Zod schema helpers for common validation patterns.
 *
 * @module utils/zodValidation
 */

import { z } from 'zod';

export const zString = z.string().min(1);
export const zNullableString = (maxLength?: number) => {
  let schema = z.string();
  if (maxLength) {
    schema = schema.max(maxLength);
  }
  return schema.nullable();
};

export const zName = z.string().min(1).max(200);
export const zNullableDescription = z.string().max(500).nullable();

export const zFK = z.coerce.number().int().positive();
export const zNullableFK = z.coerce.number().int().positive().nullable();

export const zBit = z.coerce.number().int().min(0).max(1);

export const zDateString = z.string().datetime();
