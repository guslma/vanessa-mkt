import fs from 'fs';
import path from 'path';
import { pool } from '../../db/pool';
import { env } from '../../config/env';
import { HttpError } from '../../middleware/errorHandler';

export interface AnexoRecord {
  id: string;
  tarefa_id: string;
  nome_original: string;
  caminho_arquivo: string;
  mime_type: string | null;
  tamanho_bytes: number | null;
  created_at: string;
  uploaded_by_name: string | null;
}

export function ensureUploadsDir() {
  fs.mkdirSync(env.uploadsDir, { recursive: true });
}

export async function listAnexos(tarefaId: string): Promise<AnexoRecord[]> {
  const { rows } = await pool.query(
    `SELECT a.id, a.tarefa_id, a.nome_original, a.caminho_arquivo, a.mime_type, a.tamanho_bytes, a.created_at,
            u.name AS uploaded_by_name
     FROM tarefa_anexos a
     LEFT JOIN users u ON u.id = a.uploaded_by
     WHERE a.tarefa_id = $1
     ORDER BY a.created_at DESC`,
    [tarefaId],
  );
  return rows;
}

export async function createAnexo(tarefaId: string, file: Express.Multer.File, uploadedBy?: string) {
  const { rows } = await pool.query(
    `INSERT INTO tarefa_anexos (tarefa_id, nome_original, caminho_arquivo, mime_type, tamanho_bytes, uploaded_by)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, tarefa_id, nome_original, caminho_arquivo, mime_type, tamanho_bytes, created_at`,
    [tarefaId, file.originalname, file.filename, file.mimetype, file.size, uploadedBy ?? null],
  );
  return rows[0];
}

export async function getAnexoForDownload(anexoId: string) {
  const { rows } = await pool.query(
    'SELECT id, nome_original, caminho_arquivo, mime_type FROM tarefa_anexos WHERE id = $1',
    [anexoId],
  );
  const anexo = rows[0];
  if (!anexo) throw new HttpError(404, 'Anexo não encontrado');
  const fullPath = path.join(env.uploadsDir, anexo.caminho_arquivo);
  if (!fs.existsSync(fullPath)) throw new HttpError(404, 'Arquivo não encontrado no servidor');
  return { ...anexo, fullPath };
}

export async function deleteAnexo(anexoId: string) {
  const { rows } = await pool.query('SELECT caminho_arquivo FROM tarefa_anexos WHERE id = $1', [anexoId]);
  const anexo = rows[0];
  if (!anexo) throw new HttpError(404, 'Anexo não encontrado');

  await pool.query('DELETE FROM tarefa_anexos WHERE id = $1', [anexoId]);

  const fullPath = path.join(env.uploadsDir, anexo.caminho_arquivo);
  fs.unlink(fullPath, () => {});
}
