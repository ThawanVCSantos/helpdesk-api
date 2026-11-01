import { BadRequestError } from '../../../domain/errors/bad-request-error.js';
import { ForbiddenError } from '../../../domain/errors/forbidden-error.js';
import { NotFoundError } from '../../../domain/errors/not-found-error.js';
import { isUserOnly } from '../../../shared/utils/roles.js';

export class DeleteAttachment {
  constructor({ attachmentsRepository, ticketsRepository, storageService }) {
    this.attachmentsRepository = attachmentsRepository;
    this.ticketsRepository = ticketsRepository;
    this.storageService = storageService;
  }

  async execute({ attachmentId, user }) {
    const attachment = await this.attachmentsRepository.findById(attachmentId);
    if (!attachment) {
      throw new NotFoundError('Anexo não encontrado');
    }

    for (const item of attachment.tickets || []) {
      const ticket = await this.ticketsRepository.findById(item.ticketId);
      if (ticket?.status === 'CLOSED') {
        throw new BadRequestError('Não é possível remover anexo de um chamado encerrado');
      }

      if (isUserOnly(user.roles) && ticket?.requesterId !== user.id) {
        throw new ForbiddenError('Você não tem permissão para excluir este anexo');
      }
    }

    if (isUserOnly(user.roles)) {
      for (const item of attachment.comments || []) {
        if (item.comment?.userId !== user.id) {
          throw new ForbiddenError('Você só pode excluir anexos adicionados por você');
        }
      }
    }

    try {
      await this.storageService.delete(attachment.storageKey);
    } catch {
      // Mesmo se o arquivo já não existir no Cloudinary, deleta o registro do banco
    }

    await this.attachmentsRepository.delete(attachmentId);
    return { success: true };
  }
}
