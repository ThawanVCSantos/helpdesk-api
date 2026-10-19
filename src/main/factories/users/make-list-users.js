import { ListUsers } from '../../../application/use-cases/users/list-users.js';
import { usersRepository } from '../../../infrastructure/database/prisma/repositories/prisma-users-repository.js';

export function makeListUsers() {
  return new ListUsers({
    usersRepository,
  });
}
