import { createApp } from './app.js';
import { closeDatabase } from '../infrastructure/database/prisma/prisma-client.js';

const app = createApp();
const port = Number(process.env.PORT ?? 3000);

const server = app.listen(port, '0.0.0.0', () => {
  console.log(`Server is running on port ${port}`);
  console.log(`Swagger docs available at http://localhost:${port}/docs`);
});

let shuttingDown = false;

function shutdown() {
  if (shuttingDown) return;
  shuttingDown = true;

  server.close(async () => {
    try {
      await closeDatabase();
    } catch (error) {
      console.error('Failed to close database connections', error);
      process.exitCode = 1;
    }
  });
}

process.once('SIGINT', shutdown);
process.once('SIGTERM', shutdown);

export { server };
