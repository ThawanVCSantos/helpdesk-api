import { SetUserActive } from '../../../application/use-cases/users/set-user-active.js';
import { usersRepository } from '../../../infrastructure/database/prisma/repositories/prisma-users-repository.js';

export function makeSetUserActive() {
  return new SetUserActive({ usersRepository });
}
