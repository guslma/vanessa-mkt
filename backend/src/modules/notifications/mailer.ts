import nodemailer from 'nodemailer';
import { env } from '../../config/env';

let transporter: nodemailer.Transporter | null = null;

export function isMailerConfigured() {
  return Boolean(env.smtpHost && env.smtpUser && env.smtpPassword);
}

function getTransporter() {
  if (!isMailerConfigured()) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.smtpHost,
      port: env.smtpPort,
      secure: env.smtpSecure,
      auth: { user: env.smtpUser, pass: env.smtpPassword },
    });
  }
  return transporter;
}

export async function sendMail(to: string[], subject: string, html: string) {
  const t = getTransporter();
  if (!t || to.length === 0) return;
  await t.sendMail({ from: env.smtpFrom, to: to.join(','), subject, html });
}
