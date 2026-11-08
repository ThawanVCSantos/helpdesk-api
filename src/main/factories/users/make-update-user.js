import { UpdateUser } from '../../../application/use-cases/users/update-user.js';
import { PrismaUsersRepository } from '../../../infrastructure/database/prisma/repositories/prisma-users-repository.js';
import { PrismaRolesRepository } from '../../../infrastructure/database/prisma/repositories/prisma-roles-repository.js';

export function makeUpdateUser() {
  const usersRepository = new PrismaUsersRepository();
  const rolesRepository = new PrismaRolesRepository();

  return new UpdateUser({
    usersRepository,
    rolesRepository,
  });
}
