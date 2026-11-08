import { SetUserActive } from '../../../application/use-cases/users/set-user-active.js';
import { PrismaUsersRepository } from '../../../infrastructure/database/prisma/repositories/prisma-users-repository.js';

export function makeSetUserActive() {
  const usersRepository = new PrismaUsersRepository();

  return new SetUserActive({ usersRepository });
}
