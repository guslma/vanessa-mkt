import { env } from '../../config/env';
import { sendDailyDigest } from './digest.service';

let lastSentDateKey: string | null = null;

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

async function tick() {
  const now = new Date();
  const key = todayKey();
  if (now.getHours() === env.dailyDigestHour && lastSentDateKey !== key) {
    lastSentDateKey = key;
    try {
      const result = await sendDailyDigest();
      console.log('Resumo diário por e-mail:', result);
    } catch (err) {
      console.error('Erro ao enviar resumo diário por e-mail:', err);
    }
  }
}

export function startDigestScheduler() {
  setInterval(tick, 15 * 60 * 1000); // checa a cada 15 minutos
  tick(); // checa também imediatamente ao iniciar o servidor
}
