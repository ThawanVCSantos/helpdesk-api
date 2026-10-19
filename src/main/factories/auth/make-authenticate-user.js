import { AuthenticateUser } from '../../../application/use-cases/auth/authenticate-user.js';
import { usersRepository } from '../../../infrastructure/database/prisma/repositories/prisma-users-repository.js';
import { passwordHasher } from '../../../infrastructure/security/password-hasher.js';
import { tokenService } from '../../../infrastructure/security/token-service.js';

export function makeAuthenticateUser() {
  return new AuthenticateUser({
    usersRepository,
    passwordHasher,
    tokenService,
  });
}
