import { Router } from 'express';
import multer from 'multer';
import { HttpError } from '../../middleware/errorHandler';
import { asyncHandler } from '../../middleware/errorHandler';
import { importarHandler } from './importacao.controller';

const XLSX_MIME_TYPES = new Set([
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!XLSX_MIME_TYPES.has(file.mimetype)) {
      cb(new HttpError(400, 'Envie um arquivo .xlsx'));
      return;
    }
    cb(null, true);
  },
});

export const importacaoRouter = Router();

importacaoRouter.post('/', upload.single('file'), asyncHandler(importarHandler));
