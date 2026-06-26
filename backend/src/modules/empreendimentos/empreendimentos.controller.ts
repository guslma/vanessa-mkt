import { Request, Response } from 'express';
import * as service from './empreendimentos.service';
import { empreendimentoSchema } from './empreendimentos.types';

export async function listHandler(req: Request, res: Response) {
  const { tipo, fase, search } = req.query as Record<string, string | undefined>;
  const empreendimentos = await service.listEmpreendimentos({ tipo, fase, search });
  res.json({ empreendimentos });
}

export async function getHandler(req: Request, res: Response) {
  const empreendimento = await service.getEmpreendimento(req.params.id);
  res.json({ empreendimento });
}

export async function createHandler(req: Request, res: Response) {
  const input = empreendimentoSchema.parse(req.body);
  const empreendimento = await service.createEmpreendimento(input);
  res.status(201).json({ empreendimento });
}

export async function updateHandler(req: Request, res: Response) {
  const input = empreendimentoSchema.parse(req.body);
  const empreendimento = await service.updateEmpreendimento(req.params.id, input);
  res.json({ empreendimento });
}

export async function deleteHandler(req: Request, res: Response) {
  await service.deleteEmpreendimento(req.params.id);
  res.status(204).send();
}

export async function regenerateTokenHandler(req: Request, res: Response) {
  const empreendimento = await service.regenerateToken(req.params.id);
  res.json({ empreendimento });
}
