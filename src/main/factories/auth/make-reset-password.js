import { ResetPassword } from '../../../application/use-cases/auth/reset-password.js';
import { usersRepository } from '../../../infrastructure/database/prisma/repositories/prisma-users-repository.js';
import { userTokensRepository } from '../../../infrastructure/database/prisma/repositories/prisma-user-tokens-repository.js';
import { hashService } from '../../../infrastructure/security/hash-service.js';
import { passwordHasher } from '../../../infrastructure/security/password-hasher.js';

export function makeResetPassword() {
  return new ResetPassword({
    usersRepository,
    userTokensRepository,
    hashService,
    passwordHasher,
  });
}
