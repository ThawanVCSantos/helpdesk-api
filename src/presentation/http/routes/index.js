import { Router } from 'express';
import { authRouter } from './auth-routes.js';
import { usersRouter } from './user-routes.js';

export const apiRouter = Router();

apiRouter.use('/auth', authRouter);
apiRouter.use('/users', usersRouter);
