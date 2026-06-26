import { Request, Response } from 'express';
import { z } from 'zod';
import * as service from './comentarios.service';

const createSchema = z.object({ texto: z.string().min(1).max(2000) });

export async function listHandler(req: Request, res: Response) {
  const comentarios = await service.listComentarios(req.params.id);
  res.json({ comentarios });
}

export async function createHandler(req: Request, res: Response) {
  const { texto } = createSchema.parse(req.body);
  const comentario = await service.createComentario(req.params.id, texto, req.user?.sub);
  res.status(201).json({ comentario });
}

export async function deleteHandler(req: Request, res: Response) {
  await service.deleteComentario(req.params.id, req.user!.sub, req.user!.role);
  res.status(204).send();
}
