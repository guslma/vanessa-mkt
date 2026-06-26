import { Request, Response } from 'express';
import { z } from 'zod';
import * as usersService from './users.service';

const FUNCAO_VALUES = [
  'gerente_marketing', 'social_media', 'designer', 'trafego_pago', 'copywriter',
  'video_fotografia', 'atendimento', 'comercial', 'agencia', 'outro',
] as const;

const createSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  password: z.string().min(6),
  role: z.enum(['admin', 'member']).default('member'),
  funcao: z.enum(FUNCAO_VALUES).nullable().optional(),
});

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  role: z.enum(['admin', 'member']).optional(),
  active: z.boolean().optional(),
  password: z.string().min(6).optional(),
  funcao: z.enum(FUNCAO_VALUES).nullable().optional(),
});

export async function listHandler(_req: Request, res: Response) {
  const users = await usersService.listUsers();
  res.json({ users });
}

export async function createHandler(req: Request, res: Response) {
  const input = createSchema.parse(req.body);
  const user = await usersService.createUser(input);
  res.status(201).json({ user });
}

export async function updateHandler(req: Request, res: Response) {
  const input = updateSchema.parse(req.body);
  const user = await usersService.updateUser(req.params.id, input);
  res.json({ user });
}

export async function deleteHandler(req: Request, res: Response) {
  await usersService.deleteUser(req.params.id);
  res.status(204).send();
}
