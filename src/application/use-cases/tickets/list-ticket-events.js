import { ForbiddenError } from '../../../domain/errors/forbidden-error.js';
import { NotFoundError } from '../../../domain/errors/not-found-error.js';
import { TicketEventMapper } from '../../mappers/ticket-event-mapper.js';
import { isUserOnly } from '../../../shared/utils/roles.js';

export class ListTicketEvents {
  constructor({ ticketsRepository, ticketEventsRepository }) {
    this.ticketsRepository = ticketsRepository;
    this.ticketEventsRepository = ticketEventsRepository;
  }

  async execute({ ticketId, user }) {
    const ticket = await this.ticketsRepository.findById(ticketId);
    if (!ticket) {
      throw new NotFoundError('Chamado não encontrado');
    }

    if (isUserOnly(user.roles) && ticket.requesterId !== user.id) {
      throw new ForbiddenError('Você não tem permissão para visualizar o histórico deste chamado');
    }

    const events = await this.ticketEventsRepository.findByTicketId(ticketId);
    return TicketEventMapper.toDTOList(events);
  }
}
