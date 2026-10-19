import { db } from '../prisma-client.js';

export class PrismaRolesRepository {
  constructor(prisma = db) {
    this.prisma = prisma;
  }

  async findByNames(names) {
    return this.prisma.role.findMany({
      where: { name: { in: names } },
    });
  }
}

export const rolesRepository = new PrismaRolesRepository();
