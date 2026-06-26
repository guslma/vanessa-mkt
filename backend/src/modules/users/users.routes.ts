import { Router } from 'express';
import { createHandler, deleteHandler, listHandler, updateHandler } from './users.controller';
import { requireAdmin } from '../../middleware/auth';
import { asyncHandler } from '../../middleware/errorHandler';

export const usersRouter = Router();

usersRouter.use(requireAdmin);
usersRouter.get('/', asyncHandler(listHandler));
usersRouter.post('/', asyncHandler(createHandler));
usersRouter.put('/:id', asyncHandler(updateHandler));
usersRouter.delete('/:id', asyncHandler(deleteHandler));
