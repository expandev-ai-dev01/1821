/**
 * @summary
 * Internal (authenticated) API routes configuration for V1.
 * Contains endpoints that require authentication and authorization.
 *
 * @module routes/v1/internalRoutes
 */

import { Router } from 'express';
import * as stockMovementController from '@/api/v1/internal/stock-movement/controller';

const router = Router();

router.post('/stock-movement', stockMovementController.createHandler);
router.get('/stock-movement', stockMovementController.listHandler);
router.get('/stock-movement/balance/:idProduct', stockMovementController.balanceHandler);
router.post('/stock-movement/reverse', stockMovementController.reverseHandler);
router.get('/stock-movement/shortage', stockMovementController.shortageHandler);

export default router;
