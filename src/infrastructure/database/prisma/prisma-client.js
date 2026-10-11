import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { getDatabaseUrl } from '../database-url.js';

const connectionString = getDatabaseUrl();

if (!connectionString) {
  throw new Error('Set PostgreSQL connection settings');
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

export const db = new PrismaClient({ adapter });

export async function closeDatabase() {
  await db.$disconnect();
  await pool.end();
}