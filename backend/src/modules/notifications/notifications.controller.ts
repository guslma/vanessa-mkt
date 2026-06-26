import { Request, Response } from 'express';
import { sendDailyDigest } from './digest.service';
import { isMailerConfigured } from './mailer';

export async function statusHandler(_req: Request, res: Response) {
  res.json({ configured: isMailerConfigured() });
}

export async function sendNowHandler(_req: Request, res: Response) {
  const result = await sendDailyDigest();
  res.json(result);
}
