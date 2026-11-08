import { BasePrismaRepository } from './base-prisma-repository.js';

export class PrismaRolesRepository extends BasePrismaRepository {
  async findByNames(names) {
    return this.prisma.role.findMany({
      where: { name: { in: names } },
    });
  }
}

export const rolesRepository = new PrismaRolesRepository();
