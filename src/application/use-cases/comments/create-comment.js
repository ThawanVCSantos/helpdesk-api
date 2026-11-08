import { BadRequestError } from '../../../domain/errors/bad-request-error.js';
import { ForbiddenError } from '../../../domain/errors/forbidden-error.js';
import { NotFoundError } from '../../../domain/errors/not-found-error.js';
import { CommentMapper } from '../../mappers/comment-mapper.js';
import { isUserOnly } from '../../../shared/utils/roles.js';

export class CreateComment {
  constructor({
    ticketsRepository,
    commentsRepository,
    ticketEventsRepository,
    dispatchTicketNotifications,
    transactionRunner,
  }) {
    this.ticketsRepository = ticketsRepository;
    this.commentsRepository = commentsRepository;
    this.ticketEventsRepository = ticketEventsRepository;
    this.dispatchTicketNotifications = dispatchTicketNotifications;
    this.transactionRunner = transactionRunner;
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

    const comment = await this.transactionRunner.run(async () => {
      const createdComment = await this.commentsRepository.create({
        ticketId,
        userId: user.id,
        content,
      });

      await this.ticketEventsRepository.create({
        ticketId,
        userId: user.id,
        type: 'COMMENT_ADDED',
        metadata: { commentId: createdComment.id },
      });

      if (this.dispatchTicketNotifications) {
        await this.dispatchTicketNotifications.execute({
          ticket,
          actorUserId: user.id,
          type: 'NEW_COMMENT',
        });
      }

      return createdComment;
    });

    return CommentMapper.toDTO(comment);
  }
}
