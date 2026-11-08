import { AuthenticateUser } from '../../../application/use-cases/auth/authenticate-user.js';
import { PrismaUsersRepository } from '../../../infrastructure/database/prisma/repositories/prisma-users-repository.js';
import { passwordHasher } from '../../../infrastructure/security/password-hasher.js';
import { tokenService } from '../../../infrastructure/security/token-service.js';

const usersRepository = new PrismaUsersRepository();

export function makeAuthenticateUser() {
  return new AuthenticateUser({
    usersRepository,
    passwordHasher,
    tokenService,
  });
}
