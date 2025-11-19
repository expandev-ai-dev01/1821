/**
 * @summary
 * Version 1 API router.
 * Organizes routes into external (public) and internal (authenticated) endpoints.
 *
 * @module routes/v1
 */

import { Router } from 'express';
import externalRoutes from './externalRoutes';
import internalRoutes from './internalRoutes';

const router = Router();

router.use('/external', externalRoutes);
router.use('/internal', internalRoutes);

export default router;
