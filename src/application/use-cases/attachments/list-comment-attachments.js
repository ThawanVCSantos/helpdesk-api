import { ForbiddenError } from '../../../domain/errors/forbidden-error.js';
import { NotFoundError } from '../../../domain/errors/not-found-error.js';
import { AttachmentMapper } from '../../mappers/attachment-mapper.js';
import { isUserOnly } from '../../../shared/utils/roles.js';

export class ListCommentAttachments {
  constructor({ ticketsRepository, commentsRepository, attachmentsRepository, storageService }) {
    this.ticketsRepository = ticketsRepository;
    this.commentsRepository = commentsRepository;
    this.attachmentsRepository = attachmentsRepository;
    this.storageService = storageService;
  }

  async execute({ commentId, user }) {
    const comment = await this.commentsRepository.findById(commentId);
    if (!comment) {
      throw new NotFoundError('Comentário não encontrado');
    }

    const ticket = await this.ticketsRepository.findById(comment.ticketId);
    if (!ticket) {
      throw new NotFoundError('Chamado associado não encontrado');
    }

    if (isUserOnly(user.roles) && ticket.requesterId !== user.id) {
      throw new ForbiddenError('Você não tem permissão para visualizar anexos deste comentário');
    }

    const attachments = await this.attachmentsRepository.findByCommentId(commentId);

    return attachments.map((att) =>
      AttachmentMapper.toDTO(att, { storageService: this.storageService })
    );
  }
}
