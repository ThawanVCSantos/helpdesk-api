import { Router } from 'express';
import { authRouter } from './auth-routes.js';
import { usersRouter } from './user-routes.js';
import { categoriesRouter } from './category-routes.js';
import { ticketsRouter } from './ticket-routes.js';

export const apiRouter = Router();

apiRouter.use('/auth', authRouter);
apiRouter.use('/users', usersRouter);
apiRouter.use('/categories', categoriesRouter);
apiRouter.use('/tickets', ticketsRouter);
