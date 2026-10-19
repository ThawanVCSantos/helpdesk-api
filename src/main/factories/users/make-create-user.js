import { CreateUser } from '../../../application/use-cases/users/create-user.js';
import { usersRepository } from '../../../infrastructure/database/prisma/repositories/prisma-users-repository.js';
import { rolesRepository } from '../../../infrastructure/database/prisma/repositories/prisma-roles-repository.js';
import { userTokensRepository } from '../../../infrastructure/database/prisma/repositories/prisma-user-tokens-repository.js';
import { hashService } from '../../../infrastructure/security/hash-service.js';
import { mailService } from '../../../infrastructure/email/mail-service.js';

export function makeCreateUser() {
  return new CreateUser({
    usersRepository,
    rolesRepository,
    userTokensRepository,
    hashService,
    mailService,
  });
}
