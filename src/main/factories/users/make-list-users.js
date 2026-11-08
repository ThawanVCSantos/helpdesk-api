import { ListUsers } from '../../../application/use-cases/users/list-users.js';
import { PrismaUsersRepository } from '../../../infrastructure/database/prisma/repositories/prisma-users-repository.js';

export function makeListUsers() {
  const usersRepository = new PrismaUsersRepository();

  return new ListUsers({
    usersRepository,
  });
}
