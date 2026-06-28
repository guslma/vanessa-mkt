import { Request, Response } from 'express';
import { z } from 'zod';
import { sendDailyDigest } from './digest.service';
import { isPushConfigured, removeSubscription, saveSubscription } from './push.service';
import { env } from '../../config/env';
import { HttpError } from '../../middleware/errorHandler';

export async function statusHandler(_req: Request, res: Response) {
  res.json({ configured: isPushConfigured(), publicKey: env.vapidPublicKey ?? null });
}

export async function sendNowHandler(_req: Request, res: Response) {
  const result = await sendDailyDigest();
  res.json(result);
}

const subscribeSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({ p256dh: z.string(), auth: z.string() }),
});

export async function subscribeHandler(req: Request, res: Response) {
  if (!req.user) throw new HttpError(401, 'Não autenticado');
  const input = subscribeSchema.parse(req.body);
  await saveSubscription(req.user.sub, input);
  res.status(201).json({ ok: true });
}

const unsubscribeSchema = z.object({ endpoint: z.string().url() });

export async function unsubscribeHandler(req: Request, res: Response) {
  const { endpoint } = unsubscribeSchema.parse(req.body);
  await removeSubscription(endpoint);
  res.status(204).end();
}
