import { BadRequestError } from '../../../domain/errors/bad-request-error.js';
import { NotFoundError } from '../../../domain/errors/not-found-error.js';
import { TicketMapper } from '../../mappers/ticket-mapper.js';
import { VALID_STATUSES, calculateClosedAt } from '../../../shared/utils/ticket-status.js';

export { VALID_STATUSES };

export class ChangeTicketStatus {
  constructor({ ticketsRepository, ticketEventsRepository }) {
    this.ticketsRepository = ticketsRepository;
    this.ticketEventsRepository = ticketEventsRepository;
  }

  async execute({ id, actorUser, status }) {
    const ticket = await this.ticketsRepository.findById(id);
    if (!ticket) {
      throw new NotFoundError('Chamado não encontrado');
    }

    if (!VALID_STATUSES.includes(status)) {
      throw new BadRequestError(`Status inválido: ${status}`);
    }

    if (ticket.status === status) {
      return TicketMapper.toDTO(ticket);
    }

    const closedAt = calculateClosedAt(status, ticket.closedAt);

    const updated = await this.ticketsRepository.update(id, {
      status,
      closedAt,
    });

    await this.ticketEventsRepository.create({
      ticketId: id,
      userId: actorUser.id,
      type: 'STATUS_CHANGED',
      metadata: {
        oldStatus: ticket.status,
        newStatus: status,
      },
    });

    return TicketMapper.toDTO(updated);
  }
}
