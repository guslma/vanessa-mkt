import { Request, Response } from 'express';
import * as service from './public.service';

export async function getEmpreendimentoHandler(req: Request, res: Response) {
  const empreendimento = await service.getPublicEmpreendimento(req.params.token);
  const tarefas = await service.getPublicTarefas(empreendimento.id);
  res.json({ empreendimento, tarefas });
}
