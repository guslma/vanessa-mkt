import { Request, Response } from 'express';
import * as service from './tarefas.service';
import { statusUpdateSchema, tarefaSchema } from './tarefas.types';
import { writeTarefasPdf, writeTarefasXlsx } from './export.service';

export async function listHandler(req: Request, res: Response) {
  const tarefas = await service.listTarefas(req.query as Record<string, string | undefined>);
  res.json({ tarefas });
}

export async function getHandler(req: Request, res: Response) {
  const tarefa = await service.getTarefa(req.params.id);
  res.json({ tarefa });
}

export async function createHandler(req: Request, res: Response) {
  const input = tarefaSchema.parse(req.body);
  const tarefa = await service.createTarefa(input, req.user?.sub);
  res.status(201).json({ tarefa });
}

export async function updateHandler(req: Request, res: Response) {
  const input = tarefaSchema.parse(req.body);
  const tarefa = await service.updateTarefa(req.params.id, input, req.user?.sub);
  res.json({ tarefa });
}

export async function updateStatusHandler(req: Request, res: Response) {
  const { status } = statusUpdateSchema.parse(req.body);
  const tarefa = await service.updateStatus(req.params.id, status, req.user?.sub);
  res.json({ tarefa });
}

export async function deleteHandler(req: Request, res: Response) {
  await service.deleteTarefa(req.params.id);
  res.status(204).send();
}

export async function kanbanHandler(_req: Request, res: Response) {
  const board = await service.getKanban();
  res.json(board);
}

export async function eventosHandler(req: Request, res: Response) {
  const eventos = await service.listEventos(req.params.id);
  res.json({ eventos });
}

export async function exportXlsxHandler(req: Request, res: Response) {
  const tarefas = await service.listTarefas(req.query as Record<string, string | undefined>);
  await writeTarefasXlsx(tarefas, res);
}

export async function exportPdfHandler(req: Request, res: Response) {
  const tarefas = await service.listTarefas(req.query as Record<string, string | undefined>);
  writeTarefasPdf(tarefas, res);
}
