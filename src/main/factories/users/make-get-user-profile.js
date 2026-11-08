import { GetUserProfile } from '../../../application/use-cases/users/get-user-profile.js';
import { PrismaUsersRepository } from '../../../infrastructure/database/prisma/repositories/prisma-users-repository.js';

export function makeGetUserProfile() {
  const usersRepository = new PrismaUsersRepository();

  return new GetUserProfile({
    usersRepository,
  });
}
