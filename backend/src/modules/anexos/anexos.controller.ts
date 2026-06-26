import { Request, Response } from 'express';
import * as service from './anexos.service';
import { HttpError } from '../../middleware/errorHandler';
import { logTarefaEvento } from '../tarefas/tarefas.service';

export async function listHandler(req: Request, res: Response) {
  const anexos = await service.listAnexos(req.params.id);
  res.json({ anexos });
}

export async function uploadHandler(req: Request, res: Response) {
  if (!req.file) throw new HttpError(400, 'Nenhum arquivo enviado');
  const anexo = await service.createAnexo(req.params.id, req.file, req.user?.sub);
  await logTarefaEvento(req.params.id, req.user?.sub, `Arquivo anexado: "${req.file.originalname}"`);
  res.status(201).json({ anexo });
}

export async function downloadHandler(req: Request, res: Response) {
  const anexo = await service.getAnexoForDownload(req.params.id);
  res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(anexo.nome_original)}"`);
  if (anexo.mime_type) res.setHeader('Content-Type', anexo.mime_type);
  res.sendFile(anexo.fullPath);
}

export async function deleteHandler(req: Request, res: Response) {
  await service.deleteAnexo(req.params.id);
  res.status(204).send();
}
