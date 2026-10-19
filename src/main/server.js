import { createApp } from './app.js';
import { closeDatabase } from '../infrastructure/database/prisma/prisma-client.js';
import { logger } from '../infrastructure/logging/logger.js';

const app = createApp();
const port = Number(process.env.PORT ?? 3000);

const server = app.listen(port, '0.0.0.0', () => {
  logger.info('Server started', { port });
  logger.info('Swagger documentation available', { url: `http://localhost:${port}/docs` });
});

let shuttingDown = false;

function shutdown() {
  if (shuttingDown) return;
  shuttingDown = true;

  server.close(async () => {
    try {
      await closeDatabase();
    } catch (error) {
      logger.error('Failed to close database connections', { error: error.message });
      process.exitCode = 1;
    }
  });
}

process.once('SIGINT', shutdown);
process.once('SIGTERM', shutdown);

export { server };
