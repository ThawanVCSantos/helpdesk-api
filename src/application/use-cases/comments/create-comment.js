import { BadRequestError } from '../../../domain/errors/bad-request-error.js';
import { ForbiddenError } from '../../../domain/errors/forbidden-error.js';
import { NotFoundError } from '../../../domain/errors/not-found-error.js';
import { CommentMapper } from '../../mappers/comment-mapper.js';
import { isUserOnly } from '../../../shared/utils/roles.js';
import { logger } from '../../../infrastructure/logging/logger.js';

export class CreateComment {
  constructor({ ticketsRepository, commentsRepository, ticketEventsRepository, dispatchTicketNotifications = null }) {
    this.ticketsRepository = ticketsRepository;
    this.commentsRepository = commentsRepository;
    this.ticketEventsRepository = ticketEventsRepository;
    this.dispatchTicketNotifications = dispatchTicketNotifications;
  }

  async execute({ ticketId, user, content }) {
    const ticket = await this.ticketsRepository.findById(ticketId);
    if (!ticket) {
      throw new NotFoundError('Chamado não encontrado');
    }

    if (ticket.status === 'CLOSED') {
      throw new BadRequestError('Não é possível adicionar comentários a um chamado encerrado');
    }

    if (isUserOnly(user.roles) && ticket.requesterId !== user.id) {
      throw new ForbiddenError('Você só pode comentar em chamados que você mesmo abriu');
    }

    const comment = await this.commentsRepository.create({
      ticketId,
      userId: user.id,
      content,
    });

    await this.ticketEventsRepository.create({
      ticketId,
      userId: user.id,
      type: 'COMMENT_ADDED',
      metadata: { commentId: comment.id },
    });

    if (this.dispatchTicketNotifications) {
      try {
        await this.dispatchTicketNotifications.execute({
          ticket,
          actorUserId: user.id,
          type: 'NEW_COMMENT',
        });
      } catch (error) {
        logger.error('Failed to dispatch comment notifications', {
          ticketId,
          commentId: comment.id,
          actorUserId: user.id,
          error: error.message,
        });
      }
    }

    return CommentMapper.toDTO(comment);
  }
}
