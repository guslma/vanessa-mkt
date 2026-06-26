import { createApp } from './app';
import { env } from './config/env';
import { startDigestScheduler } from './modules/notifications/scheduler';

const app = createApp();

app.listen(env.port, () => {
  console.log(`Marketing Tracker API ouvindo na porta ${env.port}`);
  startDigestScheduler();
});
