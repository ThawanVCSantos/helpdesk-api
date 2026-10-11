import express from 'express';
import { setupSwagger } from '../presentation/http/swagger.js';

export function createApp() {
  const app = express();

  app.use(express.json());

  setupSwagger(app);

  app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  return app;
}
