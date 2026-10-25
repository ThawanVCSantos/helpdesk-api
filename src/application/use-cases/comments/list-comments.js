import { ForbiddenError } from '../../../domain/errors/forbidden-error.js';
import { NotFoundError } from '../../../domain/errors/not-found-error.js';
import { CommentMapper } from '../../mappers/comment-mapper.js';
import { isUserOnly } from '../../../shared/utils/roles.js';

export class ListComments {
  constructor({ ticketsRepository, commentsRepository }) {
    this.ticketsRepository = ticketsRepository;
    this.commentsRepository = commentsRepository;
  }

  async execute({ ticketId, user }) {
    const ticket = await this.ticketsRepository.findById(ticketId);
    if (!ticket) {
      throw new NotFoundError('Chamado não encontrado');
    }

    if (isUserOnly(user.roles) && ticket.requesterId !== user.id) {
      throw new ForbiddenError('Você não tem permissão para visualizar os comentários deste chamado');
    }

    const comments = await this.commentsRepository.findByTicketId(ticketId);
    return CommentMapper.toDTOList(comments);
  }
}
