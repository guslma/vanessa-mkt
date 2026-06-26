import { Router } from 'express';
import {
  createHandler, deleteHandler, eventosHandler, exportPdfHandler, exportXlsxHandler, getHandler,
  kanbanHandler, listHandler, updateHandler, updateStatusHandler,
} from './tarefas.controller';
import { listHandler as listAnexosHandler, uploadHandler as uploadAnexoHandler } from '../anexos/anexos.controller';
import { upload } from '../anexos/upload';
import { createHandler as createComentarioHandler, listHandler as listComentariosHandler } from '../comentarios/comentarios.controller';
import { asyncHandler } from '../../middleware/errorHandler';

export const tarefasRouter = Router();

tarefasRouter.get('/kanban', asyncHandler(kanbanHandler));
tarefasRouter.get('/export.xlsx', asyncHandler(exportXlsxHandler));
tarefasRouter.get('/export.pdf', asyncHandler(exportPdfHandler));
tarefasRouter.get('/', asyncHandler(listHandler));
tarefasRouter.get('/:id', asyncHandler(getHandler));
tarefasRouter.get('/:id/eventos', asyncHandler(eventosHandler));
tarefasRouter.get('/:id/anexos', asyncHandler(listAnexosHandler));
tarefasRouter.post('/:id/anexos', upload.single('file'), asyncHandler(uploadAnexoHandler));
tarefasRouter.get('/:id/comentarios', asyncHandler(listComentariosHandler));
tarefasRouter.post('/:id/comentarios', asyncHandler(createComentarioHandler));
tarefasRouter.post('/', asyncHandler(createHandler));
tarefasRouter.put('/:id', asyncHandler(updateHandler));
tarefasRouter.patch('/:id/status', asyncHandler(updateStatusHandler));
tarefasRouter.delete('/:id', asyncHandler(deleteHandler));
