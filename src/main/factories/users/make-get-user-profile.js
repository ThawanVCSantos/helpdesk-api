import { GetUserProfile } from '../../../application/use-cases/users/get-user-profile.js';
import { usersRepository } from '../../../infrastructure/database/prisma/repositories/prisma-users-repository.js';

export function makeGetUserProfile() {
  return new GetUserProfile({
    usersRepository,
  });
}
