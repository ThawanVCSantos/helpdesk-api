import express from 'express';
import { setupSwagger } from '../presentation/http/swagger.js';
import { apiRouter } from '../presentation/http/routes/index.js';
import { errorHandlerMiddleware } from '../presentation/http/middlewares/error-handler.js';

export function createApp() {
  const app = express();

  app.use(express.json());

  setupSwagger(app);

  app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  app.use(apiRouter);

  app.use(errorHandlerMiddleware);

  return app;
}
