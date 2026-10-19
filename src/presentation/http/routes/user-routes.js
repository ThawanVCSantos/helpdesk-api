import { Router } from 'express';
import { makeUsersController } from '../../../main/factories/users/make-users-controller.js';
import { validateSchema } from '../middlewares/validate-schema.js';
import { ensureAuthenticated } from '../middlewares/ensure-authenticated.js';
import { ensureHasRole } from '../middlewares/ensure-has-role.js';
import { createUserSchema } from '../validators/users/create-user-schema.js';
import { updateUserSchema } from '../validators/users/update-user-schema.js';
import { toggleUserActiveSchema } from '../validators/users/toggle-user-active-schema.js';
import { getUserByIdSchema } from '../validators/users/get-user-by-id-schema.js';
import { listUsersSchema } from '../validators/users/list-users-schema.js';

export const usersRouter = Router();
const usersController = makeUsersController();

usersRouter.use(ensureAuthenticated());
usersRouter.use(ensureHasRole('ADMIN'));

usersRouter.post('/', validateSchema(createUserSchema), usersController.create);
usersRouter.get('/', validateSchema(listUsersSchema), usersController.list);
usersRouter.get('/:id', validateSchema(getUserByIdSchema), usersController.getById);
usersRouter.put('/:id', validateSchema(updateUserSchema), usersController.update);
usersRouter.patch('/:id/active', validateSchema(toggleUserActiveSchema), usersController.setActive);
