import { ForgotPassword } from '../../../application/use-cases/auth/forgot-password.js';
import { PrismaUsersRepository } from '../../../infrastructure/database/prisma/repositories/prisma-users-repository.js';
import {
  PrismaUserTokensRepository,
} from '../../../infrastructure/database/prisma/repositories/prisma-user-tokens-repository.js';
import { hashService } from '../../../infrastructure/security/hash-service.js';
import { mailService } from '../../../infrastructure/email/mail-service.js';
import { PrismaTransactionRunner } from '../../../infrastructure/database/prisma/prisma-transaction-runner.js';

const usersRepository = new PrismaUsersRepository();
const userTokensRepository = new PrismaUserTokensRepository();
const transactionRunner = new PrismaTransactionRunner();

export function makeForgotPassword() {
  return new ForgotPassword({
    usersRepository,
    userTokensRepository,
    hashService,
    mailService,
    transactionRunner,
  });
}
