import { Router } from 'express';
import { sendNowHandler, statusHandler, subscribeHandler, unsubscribeHandler } from './notifications.controller';
import { requireAdmin } from '../../middleware/auth';
import { asyncHandler } from '../../middleware/errorHandler';

export const notificationsRouter = Router();

notificationsRouter.use(requireAdmin);
notificationsRouter.get('/status', asyncHandler(statusHandler));
notificationsRouter.post('/send-now', asyncHandler(sendNowHandler));
notificationsRouter.post('/subscribe', asyncHandler(subscribeHandler));
notificationsRouter.post('/unsubscribe', asyncHandler(unsubscribeHandler));
