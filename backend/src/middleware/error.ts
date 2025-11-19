/**
 * @summary
 * Global error handling middleware.
 * Catches and formats all unhandled errors in the application.
 *
 * @module middleware/error
 */

import { Request, Response, NextFunction } from 'express';
import { errorResponse } from './crud';

export function errorMiddleware(error: any, req: Request, res: Response, next: NextFunction): void {
  console.error('Error:', error);

  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal server error';

  res.status(statusCode).json(errorResponse(message, error.code));
}
