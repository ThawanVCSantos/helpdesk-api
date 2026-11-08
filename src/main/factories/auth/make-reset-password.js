import { ResetPassword } from '../../../application/use-cases/auth/reset-password.js';
import {
  PrismaUsersRepository,
} from '../../../infrastructure/database/prisma/repositories/prisma-users-repository.js';
import {
  PrismaUserTokensRepository,
} from '../../../infrastructure/database/prisma/repositories/prisma-user-tokens-repository.js';
import { hashService } from '../../../infrastructure/security/hash-service.js';
import { passwordHasher } from '../../../infrastructure/security/password-hasher.js';
import { PrismaTransactionRunner } from '../../../infrastructure/database/prisma/prisma-transaction-runner.js';

const usersRepository = new PrismaUsersRepository();
const userTokensRepository = new PrismaUserTokensRepository();
const transactionRunner = new PrismaTransactionRunner();

export function makeResetPassword() {
  return new ResetPassword({
    usersRepository,
    userTokensRepository,
    hashService,
    passwordHasher,
    transactionRunner,
  });
}
