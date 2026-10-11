import 'dotenv/config';
import { defineConfig } from 'prisma/config';
import { getDatabaseUrl } from './src/infrastructure/database/database-url.js';

export default defineConfig({
  schema: './prisma/schema.prisma',
  migrations: {
    path: './prisma/migrations',
    seed: 'bun ./prisma/seed.js',
  },
  datasource: {
    url: getDatabaseUrl(),
  },
});