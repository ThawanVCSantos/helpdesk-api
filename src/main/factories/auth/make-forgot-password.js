import { ForgotPassword } from '../../../application/use-cases/auth/forgot-password.js';
import { usersRepository } from '../../../infrastructure/database/prisma/repositories/prisma-users-repository.js';
import { userTokensRepository } from '../../../infrastructure/database/prisma/repositories/prisma-user-tokens-repository.js';
import { hashService } from '../../../infrastructure/security/hash-service.js';
import { mailService } from '../../../infrastructure/email/mail-service.js';

export function makeForgotPassword() {
  return new ForgotPassword({
    usersRepository,
    userTokensRepository,
    hashService,
    mailService,
  });
}
