/**
 * @summary
 * 404 Not Found middleware.
 * Handles requests to undefined routes.
 *
 * @module middleware/notFound
 */

import { Request, Response } from 'express';
import { errorResponse } from './crud';

export function notFoundMiddleware(req: Request, res: Response): void {
  res.status(404).json(errorResponse('Route not found', 'NOT_FOUND'));
}
