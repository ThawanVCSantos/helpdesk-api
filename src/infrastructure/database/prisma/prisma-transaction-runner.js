import { db } from './prisma-client.js';
import { transactionContext } from './transaction-context.js';

export class PrismaTransactionRunner {
  constructor({ prisma = db } = {}) {
    this.prisma = prisma;
  }

  async run(operation) {
    const currentTx = transactionContext.getStore();
    if (currentTx) {
      return operation();
    }

    return this.prisma.$transaction(async (tx) => {
      return transactionContext.run(tx, () => operation());
    });
  }
}
