import { Router } from 'express';
import { makeTicketsController } from '../../../main/factories/tickets/make-tickets-controller.js';
import { validateSchema } from '../middlewares/validate-schema.js';
import { ensureAuthenticated } from '../middlewares/ensure-authenticated.js';
import { ensureHasRole } from '../middlewares/ensure-has-role.js';

import { createTicketSchema } from '../validators/tickets/create-ticket-schema.js';
import { listTicketsSchema } from '../validators/tickets/list-tickets-schema.js';
import { getTicketByIdSchema } from '../validators/tickets/get-ticket-by-id-schema.js';
import { updateTicketSchema } from '../validators/tickets/update-ticket-schema.js';
import { assignTicketSchema } from '../validators/tickets/assign-ticket-schema.js';
import { changeTicketStatusSchema } from '../validators/tickets/change-ticket-status-schema.js';
import { createCommentSchema } from '../validators/tickets/create-comment-schema.js';
import { listCommentsSchema } from '../validators/tickets/list-comments-schema.js';
import { listTicketEventsSchema } from '../validators/tickets/list-ticket-events-schema.js';

export const ticketsRouter = Router();
const ticketsController = makeTicketsController();

ticketsRouter.use(ensureAuthenticated());

ticketsRouter.post('/', validateSchema(createTicketSchema), ticketsController.create);
ticketsRouter.get('/', validateSchema(listTicketsSchema), ticketsController.list);
ticketsRouter.get('/:id', validateSchema(getTicketByIdSchema), ticketsController.getById);
ticketsRouter.put('/:id', validateSchema(updateTicketSchema), ticketsController.update);

ticketsRouter.patch(
  '/:id/assign',
  ensureHasRole(['AGENT', 'ADMIN']),
  validateSchema(assignTicketSchema),
  ticketsController.assign
);

ticketsRouter.patch(
  '/:id/status',
  ensureHasRole(['AGENT', 'ADMIN']),
  validateSchema(changeTicketStatusSchema),
  ticketsController.changeStatus
);

ticketsRouter.post('/:ticketId/comments', validateSchema(createCommentSchema), ticketsController.createComment);
ticketsRouter.get('/:ticketId/comments', validateSchema(listCommentsSchema), ticketsController.listComments);

ticketsRouter.get('/:ticketId/events', validateSchema(listTicketEventsSchema), ticketsController.listEvents);
