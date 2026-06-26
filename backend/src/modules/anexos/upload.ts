import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import { env } from '../../config/env';
import { ensureUploadsDir } from './anexos.service';
import { HttpError } from '../../middleware/errorHandler';

ensureUploadsDir();

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, env.uploadsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${crypto.randomUUID()}${ext}`);
  },
});

// Tipos de arquivo que ela realmente usa: imagens, PDFs, planilhas/documentos
// e vídeos curtos (material de campanha, contratos, fotos de obra etc).
// Bloqueia executáveis, scripts e outros formatos sem uso aqui.
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg', 'image/png', 'image/webp', 'image/gif',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'video/mp4', 'video/quicktime',
  'text/plain', 'text/csv',
]);

export const upload = multer({
  storage,
  limits: { fileSize: env.maxUploadSizeMb * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      cb(new HttpError(400, 'Tipo de arquivo não permitido. Use imagens, PDF, planilhas, documentos ou vídeos.'));
      return;
    }
    cb(null, true);
  },
});
