import { Request, Response } from 'express';
import { z } from 'zod';
import * as authService from './auth.service';
import { HttpError } from '../../middleware/errorHandler';

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export async function loginHandler(req: Request, res: Response) {
  const { username, password } = loginSchema.parse(req.body);
  const result = await authService.login(username, password);
  res.json(result);
}

export async function meHandler(req: Request, res: Response) {
  const user = await authService.getUserById(req.user!.sub);
  if (!user) {
    throw new HttpError(404, 'Usuário não encontrado');
  }
  res.json({ user });
}
