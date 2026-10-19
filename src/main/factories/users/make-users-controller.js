import { UsersController } from '../../../presentation/http/controllers/users-controller.js';
import { makeCreateUser } from './make-create-user.js';
import { makeListUsers } from './make-list-users.js';
import { makeGetUserProfile } from './make-get-user-profile.js';
import { makeUpdateUser } from './make-update-user.js';
import { makeSetUserActive } from './make-set-user-active.js';

export function makeUsersController() {
  return new UsersController({
    createUserUseCase: makeCreateUser(),
    listUsersUseCase: makeListUsers(),
    getUserProfileUseCase: makeGetUserProfile(),
    updateUserUseCase: makeUpdateUser(),
    setUserActiveUseCase: makeSetUserActive(),
  });
}
