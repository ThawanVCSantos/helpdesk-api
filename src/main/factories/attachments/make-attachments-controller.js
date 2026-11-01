import { PrismaAttachmentsRepository } from '../../../infrastructure/database/prisma/repositories/prisma-attachments-repository.js';
import { PrismaTicketsRepository } from '../../../infrastructure/database/prisma/repositories/prisma-tickets-repository.js';
import { PrismaCommentsRepository } from '../../../infrastructure/database/prisma/repositories/prisma-comments-repository.js';
import { PrismaTicketEventsRepository } from '../../../infrastructure/database/prisma/repositories/prisma-ticket-events-repository.js';
import { CloudinaryStorageService } from '../../../infrastructure/storage/cloudinary-storage-service.js';

import { UploadTicketAttachment } from '../../../application/use-cases/attachments/upload-ticket-attachment.js';
import { UploadCommentAttachment } from '../../../application/use-cases/attachments/upload-comment-attachment.js';
import { ListTicketAttachments } from '../../../application/use-cases/attachments/list-ticket-attachments.js';
import { ListCommentAttachments } from '../../../application/use-cases/attachments/list-comment-attachments.js';
import { DeleteAttachment } from '../../../application/use-cases/attachments/delete-attachment.js';
import { AttachmentsController } from '../../../presentation/http/controllers/attachments-controller.js';

export const makeAttachmentsController = () => {
  const attachmentsRepository = new PrismaAttachmentsRepository();
  const ticketsRepository = new PrismaTicketsRepository();
  const commentsRepository = new PrismaCommentsRepository();
  const ticketEventsRepository = new PrismaTicketEventsRepository();
  const storageService = new CloudinaryStorageService();

  const uploadTicketAttachment = new UploadTicketAttachment({
    ticketsRepository,
    attachmentsRepository,
    ticketEventsRepository,
    storageService,
  });

  const uploadCommentAttachment = new UploadCommentAttachment({
    ticketsRepository,
    commentsRepository,
    attachmentsRepository,
    ticketEventsRepository,
    storageService,
  });

  const listTicketAttachments = new ListTicketAttachments({
    ticketsRepository,
    attachmentsRepository,
    storageService,
  });

  const listCommentAttachments = new ListCommentAttachments({
    ticketsRepository,
    commentsRepository,
    attachmentsRepository,
    storageService,
  });

  const deleteAttachment = new DeleteAttachment({
    attachmentsRepository,
    ticketsRepository,
    storageService,
  });

  return new AttachmentsController({
    uploadTicketAttachment,
    uploadCommentAttachment,
    listTicketAttachments,
    listCommentAttachments,
    deleteAttachment,
  });
};
