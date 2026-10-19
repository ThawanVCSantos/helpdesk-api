import { Router } from 'express';
import { makeAuthController } from '../../../main/factories/auth/make-auth-controller.js';
import { validateSchema } from '../middlewares/validate-schema.js';
import { ensureAuthenticated } from '../middlewares/ensure-authenticated.js';
import { loginSchema } from '../validators/auth/login-schema.js';
import { forgotPasswordSchema } from '../validators/auth/forgot-password-schema.js';
import { resetPasswordSchema } from '../validators/auth/reset-password-schema.js';

export const authRouter = Router();
const authController = makeAuthController();

authRouter.post('/login', validateSchema(loginSchema), authController.login);
authRouter.post('/forgot-password', validateSchema(forgotPasswordSchema), authController.forgotPassword);
authRouter.post('/reset-password', validateSchema(resetPasswordSchema), authController.resetPassword);
authRouter.get('/me', ensureAuthenticated(), authController.me);
