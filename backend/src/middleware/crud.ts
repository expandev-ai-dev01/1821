/**
 * @summary
 * CRUD operation middleware utilities.
 * Provides standardized response formatting and error handling.
 *
 * @module middleware/crud
 */

import { Request } from 'express';
import { z } from 'zod';

export interface CrudPermission {
  securable: string;
  permission: 'CREATE' | 'READ' | 'UPDATE' | 'DELETE';
}

export interface ValidationResult {
  credential: {
    idAccount: number;
    idUser: number;
  };
  params: any;
}

export class CrudController {
  private permissions: CrudPermission[];

  constructor(permissions: CrudPermission[]) {
    this.permissions = permissions;
  }

  async create(
    req: Request,
    schema: z.ZodSchema
  ): Promise<[ValidationResult | undefined, Error | undefined]> {
    try {
      const params = await schema.parseAsync(req.body);
      return [
        {
          credential: {
            idAccount: 1,
            idUser: 1,
          },
          params,
        },
        undefined,
      ];
    } catch (error: any) {
      return [undefined, error];
    }
  }

  async read(
    req: Request,
    schema: z.ZodSchema
  ): Promise<[ValidationResult | undefined, Error | undefined]> {
    try {
      const params = await schema.parseAsync(req.params);
      return [
        {
          credential: {
            idAccount: 1,
            idUser: 1,
          },
          params,
        },
        undefined,
      ];
    } catch (error: any) {
      return [undefined, error];
    }
  }

  async update(
    req: Request,
    paramsSchema: z.ZodSchema,
    bodySchema: z.ZodSchema
  ): Promise<[ValidationResult | undefined, Error | undefined]> {
    try {
      const params = await paramsSchema.parseAsync(req.params);
      const body = await bodySchema.parseAsync(req.body);
      return [
        {
          credential: {
            idAccount: 1,
            idUser: 1,
          },
          params: { ...params, ...body },
        },
        undefined,
      ];
    } catch (error: any) {
      return [undefined, error];
    }
  }

  async delete(
    req: Request,
    schema: z.ZodSchema
  ): Promise<[ValidationResult | undefined, Error | undefined]> {
    try {
      const params = await schema.parseAsync(req.params);
      return [
        {
          credential: {
            idAccount: 1,
            idUser: 1,
          },
          params,
        },
        undefined,
      ];
    } catch (error: any) {
      return [undefined, error];
    }
  }

  async list(
    req: Request,
    schema?: z.ZodSchema
  ): Promise<[ValidationResult | undefined, Error | undefined]> {
    try {
      const params = schema ? await schema.parseAsync(req.query) : {};
      return [
        {
          credential: {
            idAccount: 1,
            idUser: 1,
          },
          params,
        },
        undefined,
      ];
    } catch (error: any) {
      return [undefined, error];
    }
  }
}

export function successResponse<T>(data: T) {
  return {
    success: true,
    data,
    timestamp: new Date().toISOString(),
  };
}

export function errorResponse(message: string, code?: string) {
  return {
    success: false,
    error: {
      code: code || 'ERROR',
      message,
    },
    timestamp: new Date().toISOString(),
  };
}

export const StatusGeneralError = 500;
