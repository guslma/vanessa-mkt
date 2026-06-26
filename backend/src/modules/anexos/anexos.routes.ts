import { Router } from 'express';
import { deleteHandler, downloadHandler } from './anexos.controller';
import { asyncHandler } from '../../middleware/errorHandler';

export const anexosRouter = Router();

anexosRouter.get('/:id/download', asyncHandler(downloadHandler));
anexosRouter.delete('/:id', asyncHandler(deleteHandler));
