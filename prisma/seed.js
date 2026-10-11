import 'dotenv/config';
import { closeDatabase, db } from '../src/infrastructure/database/prisma/prisma-client.js';
import { seedCategories } from './seeds/categories.js';
import { seedInitialAdmin } from './seeds/initial-admin.js';
import { seedRoles } from './seeds/roles.js';

const seeds = [
  seedRoles,
  seedCategories,
  seedInitialAdmin,
]

try {
  for (const seed of seeds) {
    await seed(db);
  }
  console.log('Seed completed');
} finally {
  await closeDatabase();
}
