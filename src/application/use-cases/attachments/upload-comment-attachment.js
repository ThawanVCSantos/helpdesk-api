import { BadRequestError } from '../../../domain/errors/bad-request-error.js';
import { ForbiddenError } from '../../../domain/errors/forbidden-error.js';
import { NotFoundError } from '../../../domain/errors/not-found-error.js';
import { AttachmentMapper } from '../../mappers/attachment-mapper.js';
import { isUserOnly } from '../../../shared/utils/roles.js';

export class UploadCommentAttachment {
  constructor({ ticketsRepository, commentsRepository, attachmentsRepository, ticketEventsRepository, storageService }) {
    this.ticketsRepository = ticketsRepository;
    this.commentsRepository = commentsRepository;
    this.attachmentsRepository = attachmentsRepository;
    this.ticketEventsRepository = ticketEventsRepository;
    this.storageService = storageService;
  }

  async execute({ commentId, user, file }) {
    if (!file) {
      throw new BadRequestError('Nenhum arquivo enviado');
    }

    const comment = await this.commentsRepository.findById(commentId);
    if (!comment) {
      throw new NotFoundError('Comentário não encontrado');
    }

    const ticket = await this.ticketsRepository.findById(comment.ticketId);
    if (!ticket) {
      throw new NotFoundError('Chamado associado não encontrado');
    }

    if (ticket.status === 'CLOSED') {
      throw new BadRequestError('Não é possível adicionar anexos a um chamado encerrado');
    }

    if (isUserOnly(user.roles) && (ticket.requesterId !== user.id || comment.userId !== user.id)) {
      throw new ForbiddenError('Você só pode anexar arquivos aos seus próprios comentários');
    }

    const uploadResult = await this.storageService.upload({
      buffer: file.buffer,
      fileName: file.originalname,
      mimeType: file.mimetype,
    });

    const attachment = await this.attachmentsRepository.createForComment({
      commentId,
      storageKey: uploadResult.storageKey,
      fileName: file.originalname,
      mimeType: file.mimetype,
      size: uploadResult.bytes || file.size,
    });

    await this.ticketEventsRepository.create({
      ticketId: ticket.id,
      userId: user.id,
      type: 'ATTACHMENT_ADDED',
      metadata: {
        attachmentId: attachment.id,
        commentId,
        fileName: attachment.fileName,
      },
    });

    return AttachmentMapper.toDTO(attachment, { storageService: this.storageService });
  }
}
