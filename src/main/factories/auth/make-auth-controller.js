import { AuthController } from '../../../presentation/http/controllers/auth-controller.js';
import { makeAuthenticateUser } from './make-authenticate-user.js';
import { makeForgotPassword } from './make-forgot-password.js';
import { makeResetPassword } from './make-reset-password.js';
import { makeGetUserProfile } from '../users/make-get-user-profile.js';

export function makeAuthController() {
  return new AuthController({
    authenticateUserUseCase: makeAuthenticateUser(),
    forgotPasswordUseCase: makeForgotPassword(),
    resetPasswordUseCase: makeResetPassword(),
    getUserProfileUseCase: makeGetUserProfile(),
  });
}
