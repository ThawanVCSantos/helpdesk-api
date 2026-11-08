import { CreateUser } from '../../../application/use-cases/users/create-user.js';
import {
  PrismaUsersRepository,
} from '../../../infrastructure/database/prisma/repositories/prisma-users-repository.js';
import { PrismaRolesRepository } from '../../../infrastructure/database/prisma/repositories/prisma-roles-repository.js';
import {
  PrismaUserTokensRepository,
} from '../../../infrastructure/database/prisma/repositories/prisma-user-tokens-repository.js';
import { hashService } from '../../../infrastructure/security/hash-service.js';
import { mailService } from '../../../infrastructure/email/mail-service.js';
import { PrismaTransactionRunner } from '../../../infrastructure/database/prisma/prisma-transaction-runner.js';

const usersRepository = new PrismaUsersRepository();
const rolesRepository = new PrismaRolesRepository();
const userTokensRepository = new PrismaUserTokensRepository();
const transactionRunner = new PrismaTransactionRunner();

export function makeCreateUser() {
  return new CreateUser({
    usersRepository,
    rolesRepository,
    userTokensRepository,
    hashService,
    mailService,
    transactionRunner,
  });
}
