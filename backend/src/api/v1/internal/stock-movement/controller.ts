/**
 * @summary
 * Stock movement controller.
 * Handles HTTP requests for stock movement operations.
 *
 * @module api/v1/internal/stock-movement/controller
 */

import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import {
  CrudController,
  errorResponse,
  StatusGeneralError,
  successResponse,
} from '@/middleware/crud';
import {
  stockMovementCreate,
  stockMovementList,
  stockBalanceCalculate,
  stockMovementReverse,
  productsInShortage,
} from '@/services/stockMovement';

const securable = 'STOCK_MOVEMENT';

/**
 * @api {post} /api/v1/internal/stock-movement Create Stock Movement
 * @apiName CreateStockMovement
 * @apiGroup StockMovement
 * @apiVersion 1.0.0
 *
 * @apiDescription Creates a new stock movement record
 *
 * @apiParam {String} movementType Movement type (entrada, saída, ajuste, criação, exclusão)
 * @apiParam {Number} idProduct Product identifier
 * @apiParam {Number} quantity Quantity moved
 * @apiParam {String} [reason] Movement reason (required for ajuste and exclusão)
 * @apiParam {String} [referenceDocument] Reference document number
 *
 * @apiSuccess {Number} id Movement identifier
 * @apiSuccess {String} movementType Movement type
 * @apiSuccess {Number} previousBalance Balance before movement
 * @apiSuccess {Number} currentBalance Balance after movement
 * @apiSuccess {Boolean} belowMinimum Low stock alert flag
 *
 * @apiError {String} ValidationError Invalid parameters provided
 * @apiError {String} ServerError Internal server error
 */
export async function createHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const operation = new CrudController([{ securable, permission: 'CREATE' }]);

  const bodySchema = z.object({
    movementType: z.enum(['entrada', 'saída', 'ajuste', 'criação', 'exclusão']),
    idProduct: z.coerce.number().int().positive(),
    quantity: z.coerce.number(),
    reason: z.string().max(255).nullable().optional(),
    referenceDocument: z.string().max(50).nullable().optional(),
  });

  const [validated, error] = await operation.create(req, bodySchema);

  if (!validated) {
    return next(error);
  }

  try {
    const data = validated.params;
    const result = await stockMovementCreate({
      ...validated.credential,
      ...data,
      userName: 'System User',
      ipAddress: req.ip || '0.0.0.0',
    });

    res.json(successResponse(result));
  } catch (error: any) {
    if (error.number === 51000) {
      res.status(400).json(errorResponse(error.message));
    } else {
      res.status(StatusGeneralError).json(errorResponse('Internal server error'));
    }
  }
}

/**
 * @api {get} /api/v1/internal/stock-movement List Stock Movements
 * @apiName ListStockMovements
 * @apiGroup StockMovement
 * @apiVersion 1.0.0
 *
 * @apiDescription Lists stock movements with filtering and pagination
 *
 * @apiParam {String} [startDate] Start date filter
 * @apiParam {String} [endDate] End date filter
 * @apiParam {String} [movementType] Movement type filter
 * @apiParam {Number} [idProduct] Product filter
 * @apiParam {Number} [idUser] User filter
 * @apiParam {String} [orderBy] Sort order (data_crescente, data_decrescente)
 * @apiParam {Number} [pageSize] Page size (10-1000)
 * @apiParam {Number} [pageNumber] Page number
 *
 * @apiSuccess {Array} movements List of movements
 * @apiSuccess {Number} total Total record count
 *
 * @apiError {String} ValidationError Invalid parameters provided
 * @apiError {String} ServerError Internal server error
 */
export async function listHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  const operation = new CrudController([{ securable, permission: 'READ' }]);

  const querySchema = z.object({
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    movementType: z.enum(['entrada', 'saída', 'ajuste', 'criação', 'exclusão', 'todos']).optional(),
    idProduct: z.coerce.number().int().positive().optional(),
    idUser: z.coerce.number().int().positive().optional(),
    orderBy: z.enum(['data_crescente', 'data_decrescente']).optional(),
    pageSize: z.coerce.number().int().min(10).max(1000).optional(),
    pageNumber: z.coerce.number().int().min(1).optional(),
  });

  const [validated, error] = await operation.list(req, querySchema);

  if (!validated) {
    return next(error);
  }

  try {
    const data = validated.params;
    const result = await stockMovementList({
      ...validated.credential,
      ...data,
    });

    res.json(successResponse(result));
  } catch (error: any) {
    if (error.number === 51000) {
      res.status(400).json(errorResponse(error.message));
    } else {
      res.status(StatusGeneralError).json(errorResponse('Internal server error'));
    }
  }
}

/**
 * @api {get} /api/v1/internal/stock-movement/balance/:idProduct Calculate Stock Balance
 * @apiName CalculateStockBalance
 * @apiGroup StockMovement
 * @apiVersion 1.0.0
 *
 * @apiDescription Calculates current stock balance for a product
 *
 * @apiParam {Number} idProduct Product identifier
 * @apiParam {String} [referenceDate] Reference date for calculation
 *
 * @apiSuccess {Number} idProduct Product identifier
 * @apiSuccess {Number} calculatedBalance Current balance
 * @apiSuccess {String} lastUpdate Last movement date
 * @apiSuccess {String} stockStatus Stock status
 * @apiSuccess {Number} minimumLevel Minimum level configured
 * @apiSuccess {Number} percentageOfMinimum Percentage of minimum level
 * @apiSuccess {Array} movementHistory Movement history
 *
 * @apiError {String} ValidationError Invalid parameters provided
 * @apiError {String} ServerError Internal server error
 */
export async function balanceHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const operation = new CrudController([{ securable, permission: 'READ' }]);

  const paramsSchema = z.object({
    idProduct: z.coerce.number().int().positive(),
  });

  const querySchema = z.object({
    referenceDate: z.string().datetime().optional(),
  });

  const [validatedParams, paramsError] = await operation.read(req, paramsSchema);

  if (!validatedParams) {
    return next(paramsError);
  }

  const [validatedQuery, queryError] = await operation.list(req, querySchema);

  if (!validatedQuery) {
    return next(queryError);
  }

  try {
    const result = await stockBalanceCalculate({
      ...validatedParams.credential,
      ...validatedParams.params,
      ...validatedQuery.params,
    });

    res.json(successResponse(result));
  } catch (error: any) {
    if (error.number === 51000) {
      res.status(400).json(errorResponse(error.message));
    } else {
      res.status(StatusGeneralError).json(errorResponse('Internal server error'));
    }
  }
}

/**
 * @api {post} /api/v1/internal/stock-movement/reverse Reverse Stock Movement
 * @apiName ReverseStockMovement
 * @apiGroup StockMovement
 * @apiVersion 1.0.0
 *
 * @apiDescription Reverses a stock movement
 *
 * @apiParam {Number} idOriginalMovement Original movement identifier
 * @apiParam {String} reason Reversal reason
 *
 * @apiSuccess {Number} id Reversal movement identifier
 * @apiSuccess {Number} idOriginalMovement Original movement identifier
 * @apiSuccess {Number} previousBalance Balance before reversal
 * @apiSuccess {Number} currentBalance Balance after reversal
 *
 * @apiError {String} ValidationError Invalid parameters provided
 * @apiError {String} ServerError Internal server error
 */
export async function reverseHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const operation = new CrudController([{ securable, permission: 'DELETE' }]);

  const bodySchema = z.object({
    idOriginalMovement: z.coerce.number().int().positive(),
    reason: z.string().min(1).max(255),
  });

  const [validated, error] = await operation.create(req, bodySchema);

  if (!validated) {
    return next(error);
  }

  try {
    const data = validated.params;
    const result = await stockMovementReverse({
      ...validated.credential,
      ...data,
      userName: 'System User',
      ipAddress: req.ip || '0.0.0.0',
    });

    res.json(successResponse(result));
  } catch (error: any) {
    if (error.number === 51000) {
      res.status(400).json(errorResponse(error.message));
    } else {
      res.status(StatusGeneralError).json(errorResponse('Internal server error'));
    }
  }
}

/**
 * @api {get} /api/v1/internal/stock-movement/shortage List Products in Shortage
 * @apiName ListProductsInShortage
 * @apiGroup StockMovement
 * @apiVersion 1.0.0
 *
 * @apiDescription Lists products with low, critical, or zero stock
 *
 * @apiParam {String} [statusFilter] Status filter (baixo, crítico, zerado, todos_em_falta)
 * @apiParam {String} [orderBy] Sort order (criticidade, alfabetica)
 *
 * @apiSuccess {Array} products List of products in shortage
 *
 * @apiError {String} ValidationError Invalid parameters provided
 * @apiError {String} ServerError Internal server error
 */
export async function shortageHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const operation = new CrudController([{ securable, permission: 'READ' }]);

  const querySchema = z.object({
    statusFilter: z.enum(['baixo', 'crítico', 'zerado', 'todos_em_falta']).optional(),
    orderBy: z.enum(['criticidade', 'alfabetica']).optional(),
  });

  const [validated, error] = await operation.list(req, querySchema);

  if (!validated) {
    return next(error);
  }

  try {
    const data = validated.params;
    const result = await productsInShortage({
      ...validated.credential,
      ...data,
    });

    res.json(successResponse(result));
  } catch (error: any) {
    if (error.number === 51000) {
      res.status(400).json(errorResponse(error.message));
    } else {
      res.status(StatusGeneralError).json(errorResponse('Internal server error'));
    }
  }
}
