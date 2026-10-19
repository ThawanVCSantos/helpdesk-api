import { UpdateUser } from '../../../application/use-cases/users/update-user.js';
import { usersRepository } from '../../../infrastructure/database/prisma/repositories/prisma-users-repository.js';
import { rolesRepository } from '../../../infrastructure/database/prisma/repositories/prisma-roles-repository.js';

export function makeUpdateUser() {
  return new UpdateUser({
    usersRepository,
    rolesRepository,
  });
}
