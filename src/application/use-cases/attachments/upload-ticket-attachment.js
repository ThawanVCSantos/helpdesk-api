import { BadRequestError } from '../../../domain/errors/bad-request-error.js';
import { ForbiddenError } from '../../../domain/errors/forbidden-error.js';
import { NotFoundError } from '../../../domain/errors/not-found-error.js';
import { AttachmentMapper } from '../../mappers/attachment-mapper.js';
import { isUserOnly } from '../../../shared/utils/roles.js';

export class UploadTicketAttachment {
  constructor({ ticketsRepository, attachmentsRepository, ticketEventsRepository, storageService }) {
    this.ticketsRepository = ticketsRepository;
    this.attachmentsRepository = attachmentsRepository;
    this.ticketEventsRepository = ticketEventsRepository;
    this.storageService = storageService;
  }

  async execute({ ticketId, user, file }) {
    if (!file) {
      throw new BadRequestError('Nenhum arquivo enviado');
    }

    const ticket = await this.ticketsRepository.findById(ticketId);
    if (!ticket) {
      throw new NotFoundError('Chamado não encontrado');
    }

    if (ticket.status === 'CLOSED') {
      throw new BadRequestError('Não é possível adicionar anexos a um chamado encerrado');
    }

    if (isUserOnly(user.roles) && ticket.requesterId !== user.id) {
      throw new ForbiddenError('Você só pode adicionar anexos aos chamados que você mesmo abriu');
    }

    const uploadResult = await this.storageService.upload({
      buffer: file.buffer,
      fileName: file.originalname,
      mimeType: file.mimetype,
    });

    const attachment = await this.attachmentsRepository.createForTicket({
      ticketId,
      storageKey: uploadResult.storageKey,
      fileName: file.originalname,
      mimeType: file.mimetype,
      size: uploadResult.bytes || file.size,
    });

    await this.ticketEventsRepository.create({
      ticketId,
      userId: user.id,
      type: 'ATTACHMENT_ADDED',
      metadata: {
        attachmentId: attachment.id,
        fileName: attachment.fileName,
      },
    });

    return AttachmentMapper.toDTO(attachment, { storageService: this.storageService });
  }
}
