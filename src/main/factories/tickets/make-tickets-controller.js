import { PrismaTicketsRepository } from '../../../infrastructure/database/prisma/repositories/prisma-tickets-repository.js';
import { PrismaCategoriesRepository } from '../../../infrastructure/database/prisma/repositories/prisma-categories-repository.js';
import { PrismaTicketEventsRepository } from '../../../infrastructure/database/prisma/repositories/prisma-ticket-events-repository.js';
import { PrismaCommentsRepository } from '../../../infrastructure/database/prisma/repositories/prisma-comments-repository.js';
import { PrismaUsersRepository } from '../../../infrastructure/database/prisma/repositories/prisma-users-repository.js';
import { PrismaNotificationsRepository } from '../../../infrastructure/database/prisma/repositories/prisma-notifications-repository.js';
import { CloudinaryStorageService } from '../../../infrastructure/storage/cloudinary-storage-service.js';

import { CreateTicket } from '../../../application/use-cases/tickets/create-ticket.js';
import { ListTickets } from '../../../application/use-cases/tickets/list-tickets.js';
import { GetTicketById } from '../../../application/use-cases/tickets/get-ticket-by-id.js';
import { UpdateTicket } from '../../../application/use-cases/tickets/update-ticket.js';
import { AssignTicket } from '../../../application/use-cases/tickets/assign-ticket.js';
import { ChangeTicketStatus } from '../../../application/use-cases/tickets/change-ticket-status.js';
import { CreateComment } from '../../../application/use-cases/comments/create-comment.js';
import { ListComments } from '../../../application/use-cases/comments/list-comments.js';
import { ListTicketEvents } from '../../../application/use-cases/tickets/list-ticket-events.js';
import { GetCommentById } from '../../../application/use-cases/comments/get-comment-by-id.js';
import { DispatchTicketNotifications } from '../../../application/use-cases/notifications/dispatch-ticket-notifications.js';
import { TicketsController } from '../../../presentation/http/controllers/tickets-controller.js';

export const makeTicketsController = () => {
  const ticketsRepository = new PrismaTicketsRepository();
  const categoriesRepository = new PrismaCategoriesRepository();
  const ticketEventsRepository = new PrismaTicketEventsRepository();
  const commentsRepository = new PrismaCommentsRepository();
  const usersRepository = new PrismaUsersRepository();
  const notificationsRepository = new PrismaNotificationsRepository();
  const storageService = new CloudinaryStorageService();

  const dispatchTicketNotifications = new DispatchTicketNotifications({ notificationsRepository });

  const createTicketUseCase = new CreateTicket({
    ticketsRepository,
    categoriesRepository,
    ticketEventsRepository,
  });

  const listTicketsUseCase = new ListTickets({ ticketsRepository });
  const getTicketByIdUseCase = new GetTicketById({ ticketsRepository, storageService });

  const updateTicketUseCase = new UpdateTicket({
    ticketsRepository,
    categoriesRepository,
    ticketEventsRepository,
    dispatchTicketNotifications,
  });

  const assignTicketUseCase = new AssignTicket({
    ticketsRepository,
    usersRepository,
    ticketEventsRepository,
    dispatchTicketNotifications,
  });

  const changeTicketStatusUseCase = new ChangeTicketStatus({
    ticketsRepository,
    ticketEventsRepository,
    dispatchTicketNotifications,
  });

  const createCommentUseCase = new CreateComment({
    ticketsRepository,
    commentsRepository,
    ticketEventsRepository,
    dispatchTicketNotifications,
  });

  const listCommentsUseCase = new ListComments({
    ticketsRepository,
    commentsRepository,
    storageService,
  });

  const getCommentByIdUseCase = new GetCommentById({
    commentsRepository,
    ticketsRepository,
    storageService,
  });

  const listTicketEventsUseCase = new ListTicketEvents({
    ticketsRepository,
    ticketEventsRepository,
  });

  return new TicketsController({
    createTicketUseCase,
    listTicketsUseCase,
    getTicketByIdUseCase,
    updateTicketUseCase,
    assignTicketUseCase,
    changeTicketStatusUseCase,
    createCommentUseCase,
    listCommentsUseCase,
    getCommentByIdUseCase,
    listTicketEventsUseCase,
  });
};
