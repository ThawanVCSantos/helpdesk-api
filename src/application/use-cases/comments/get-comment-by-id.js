import { ForbiddenError } from '../../../domain/errors/forbidden-error.js';
import { NotFoundError } from '../../../domain/errors/not-found-error.js';
import { CommentMapper } from '../../mappers/comment-mapper.js';
import { isUserOnly } from '../../../shared/utils/roles.js';

export class GetCommentById {
  constructor({ commentsRepository, ticketsRepository, storageService }) {
    this.commentsRepository = commentsRepository;
    this.ticketsRepository = ticketsRepository;
    this.storageService = storageService;
  }

  async execute({ id, user }) {
    const comment = await this.commentsRepository.findById(id);
    if (!comment) throw new NotFoundError('Comentário não encontrado');

    const ticket = await this.ticketsRepository.findById(comment.ticketId);
    if (!ticket) throw new NotFoundError('Chamado associado não encontrado');

    if (isUserOnly(user.roles) && ticket.requesterId !== user.id) {
      throw new ForbiddenError('Você não tem permissão para acessar este comentário');
    }

    return CommentMapper.toDTO(comment, { storageService: this.storageService });
  }
}
