import { Router } from 'express';
import { summaryHandler } from './dashboard.controller';
import { asyncHandler } from '../../middleware/errorHandler';

export const dashboardRouter = Router();

dashboardRouter.get('/summary', asyncHandler(summaryHandler));
