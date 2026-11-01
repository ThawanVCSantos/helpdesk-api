import { ForbiddenError } from '../../../domain/errors/forbidden-error.js';
import { NotFoundError } from '../../../domain/errors/not-found-error.js';
import { AttachmentMapper } from '../../mappers/attachment-mapper.js';
import { isUserOnly } from '../../../shared/utils/roles.js';

export class ListTicketAttachments {
  constructor({ ticketsRepository, attachmentsRepository, storageService }) {
    this.ticketsRepository = ticketsRepository;
    this.attachmentsRepository = attachmentsRepository;
    this.storageService = storageService;
  }

  async execute({ ticketId, user }) {
    const ticket = await this.ticketsRepository.findById(ticketId);
    if (!ticket) {
      throw new NotFoundError('Chamado não encontrado');
    }

    if (isUserOnly(user.roles) && ticket.requesterId !== user.id) {
      throw new ForbiddenError('Você não tem permissão para visualizar anexos deste chamado');
    }

    const attachments = await this.attachmentsRepository.findByTicketId(ticketId);

    return attachments.map((att) =>
      AttachmentMapper.toDTO(att, { storageService: this.storageService })
    );
  }
}
