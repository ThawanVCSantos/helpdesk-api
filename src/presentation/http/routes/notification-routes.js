import { Router } from 'express';
import { makeNotificationsController } from '../../../main/factories/notifications/make-notifications-controller.js';
import { ensureAuthenticated } from '../middlewares/ensure-authenticated.js';
import { ensureHasRole } from '../middlewares/ensure-has-role.js';
import { validateSchema } from '../middlewares/validate-schema.js';
import {
  listNotificationsSchema,
  getNotificationByIdSchema,
} from '../validators/notifications/notification-schemas.js';

export const notificationsRouter = Router();
const notificationsController = makeNotificationsController();

notificationsRouter.use(ensureAuthenticated());

notificationsRouter.get('/', validateSchema(listNotificationsSchema), notificationsController.list);

notificationsRouter.patch(
  '/read-all',
  notificationsController.markAllAsRead
);

notificationsRouter.patch(
  '/:id/read',
  validateSchema(getNotificationByIdSchema),
  notificationsController.markAsRead
);

notificationsRouter.post(
  '/trigger-job',
  ensureHasRole(['ADMIN']),
  notificationsController.triggerJob
);
