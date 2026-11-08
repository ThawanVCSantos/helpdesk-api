import { db } from '../prisma-client.js';
import { transactionContext } from '../transaction-context.js';

export class BasePrismaRepository {
  constructor(prisma = db) {
    this.defaultPrisma = prisma;
  }

  get prisma() {
    return transactionContext.getStore() ?? this.defaultPrisma;
  }
}
