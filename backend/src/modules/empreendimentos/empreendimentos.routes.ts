import { Router } from 'express';
import {
  createHandler, deleteHandler, getHandler, listHandler, regenerateTokenHandler, updateHandler,
} from './empreendimentos.controller';
import { asyncHandler } from '../../middleware/errorHandler';
import { requireAdmin } from '../../middleware/auth';

export const empreendimentosRouter = Router();

empreendimentosRouter.get('/', asyncHandler(listHandler));
empreendimentosRouter.get('/:id', asyncHandler(getHandler));
empreendimentosRouter.post('/', asyncHandler(createHandler));
empreendimentosRouter.put('/:id', asyncHandler(updateHandler));
empreendimentosRouter.patch('/:id/regenerate-token', requireAdmin, asyncHandler(regenerateTokenHandler));
empreendimentosRouter.delete('/:id', requireAdmin, asyncHandler(deleteHandler));
