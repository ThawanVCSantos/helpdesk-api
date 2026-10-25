import { ForbiddenError } from '../../../domain/errors/forbidden-error.js';
import { NotFoundError } from '../../../domain/errors/not-found-error.js';
import { TicketMapper } from '../../mappers/ticket-mapper.js';
import { isUserOnly } from '../../../shared/utils/roles.js';

export class GetTicketById {
  constructor({ ticketsRepository }) {
    this.ticketsRepository = ticketsRepository;
  }

  async execute({ id, user }) {
    const ticket = await this.ticketsRepository.findById(id);
    if (!ticket) {
      throw new NotFoundError('Chamado não encontrado');
    }

    if (isUserOnly(user.roles) && ticket.requesterId !== user.id) {
      throw new ForbiddenError('Você não tem permissão para acessar este chamado');
    }

    return TicketMapper.toDTO(ticket);
  }
}
