import { Router } from 'express';
import { deleteHandler } from './comentarios.controller';
import { asyncHandler } from '../../middleware/errorHandler';

export const comentariosRouter = Router();

comentariosRouter.delete('/:id', asyncHandler(deleteHandler));
