import { Router } from 'express';
import { getEmpreendimentoHandler } from './public.controller';
import { asyncHandler } from '../../middleware/errorHandler';

export const publicRouter = Router();

publicRouter.get('/empreendimentos/:token', asyncHandler(getEmpreendimentoHandler));
