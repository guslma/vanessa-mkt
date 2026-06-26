import { Router } from 'express';
import { loginHandler, meHandler } from './auth.controller';
import { requireAuth } from '../../middleware/auth';
import { loginLimiter } from '../../middleware/rateLimit';
import { asyncHandler } from '../../middleware/errorHandler';

export const authRouter = Router();

authRouter.post('/login', loginLimiter, asyncHandler(loginHandler));
authRouter.get('/me', requireAuth, asyncHandler(meHandler));
