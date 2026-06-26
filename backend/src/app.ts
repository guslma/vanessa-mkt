import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { authRouter } from './modules/auth/auth.routes';
import { usersRouter } from './modules/users/users.routes';
import { empreendimentosRouter } from './modules/empreendimentos/empreendimentos.routes';
import { tarefasRouter } from './modules/tarefas/tarefas.routes';
import { dashboardRouter } from './modules/dashboard/dashboard.routes';
import { anexosRouter } from './modules/anexos/anexos.routes';
import { comentariosRouter } from './modules/comentarios/comentarios.routes';
import { publicRouter } from './modules/public/public.routes';
import { notificationsRouter } from './modules/notifications/notifications.routes';
import { requireAuth } from './middleware/auth';
import { errorHandler } from './middleware/errorHandler';
import { env } from './config/env';

export function createApp() {
  const app = express();

  app.use(helmet({
    // CSP desligada por padrão: o frontend carrega fontes do Google Fonts e
    // tiles do OpenStreetMap (mapa), e configurar a política certa exige
    // testar no navegador. Os outros headers do helmet (X-Frame-Options,
    // X-Content-Type-Options, Referrer-Policy, HSTS) já valem por si.
    contentSecurityPolicy: false,
  }));
  app.use(cors({
    origin: env.corsOrigins && env.corsOrigins.length > 0 ? env.corsOrigins : true,
  }));
  app.use(express.json());

  app.get('/api/health', (_req, res) => res.json({ ok: true }));

  app.use('/api/auth', authRouter);
  app.use('/api/users', requireAuth, usersRouter);
  app.use('/api/empreendimentos', requireAuth, empreendimentosRouter);
  app.use('/api/tarefas', requireAuth, tarefasRouter);
  app.use('/api/dashboard', requireAuth, dashboardRouter);
  app.use('/api/anexos', requireAuth, anexosRouter);
  app.use('/api/comentarios', requireAuth, comentariosRouter);
  app.use('/api/public', publicRouter);
  app.use('/api/notifications', requireAuth, notificationsRouter);

  const frontendDist = path.join(__dirname, '..', 'public');
  app.use(express.static(frontendDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(frontendDist, 'index.html'));
  });

  app.use(errorHandler);

  return app;
}
