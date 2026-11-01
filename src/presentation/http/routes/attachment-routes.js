import { Router } from 'express';
import { makeAttachmentsController } from '../../../main/factories/attachments/make-attachments-controller.js';
import { ensureAuthenticated } from '../middlewares/ensure-authenticated.js';
import { validateSchema } from '../middlewares/validate-schema.js';
import { uploadAttachmentMiddleware } from '../middlewares/upload-middleware.js';
import {
  ticketAttachmentParamsSchema,
  commentAttachmentParamsSchema,
  deleteAttachmentParamsSchema,
} from '../validators/attachments/attachment-schemas.js';

export const attachmentsRouter = Router();
const attachmentsController = makeAttachmentsController();

attachmentsRouter.use(ensureAuthenticated());

attachmentsRouter.post(
  '/tickets/:ticketId',
  validateSchema(ticketAttachmentParamsSchema),
  uploadAttachmentMiddleware.single('file'),
  attachmentsController.uploadTicket
);

attachmentsRouter.get(
  '/tickets/:ticketId',
  validateSchema(ticketAttachmentParamsSchema),
  attachmentsController.listByTicket
);

attachmentsRouter.post(
  '/comments/:commentId',
  validateSchema(commentAttachmentParamsSchema),
  uploadAttachmentMiddleware.single('file'),
  attachmentsController.uploadComment
);

attachmentsRouter.get(
  '/comments/:commentId',
  validateSchema(commentAttachmentParamsSchema),
  attachmentsController.listByComment
);

attachmentsRouter.delete(
  '/:id',
  validateSchema(deleteAttachmentParamsSchema),
  attachmentsController.delete
);
