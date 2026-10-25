import { BadRequestError } from '../../../domain/errors/bad-request-error.js';
import { NotFoundError } from '../../../domain/errors/not-found-error.js';
import { TicketMapper } from '../../mappers/ticket-mapper.js';
import { canHandleTickets } from '../../../shared/utils/roles.js';

export class AssignTicket {
  constructor({ ticketsRepository, usersRepository, ticketEventsRepository }) {
    this.ticketsRepository = ticketsRepository;
    this.usersRepository = usersRepository;
    this.ticketEventsRepository = ticketEventsRepository;
  }

  async execute({ id, actorUser, assignedUserId }) {
    const ticket = await this.ticketsRepository.findById(id);
    if (!ticket) {
      throw new NotFoundError('Chamado não encontrado');
    }

    if (ticket.status === 'CLOSED') {
      throw new BadRequestError('Não é possível alterar o responsável de um chamado encerrado');
    }

    if (assignedUserId) {
      const targetUser = await this.usersRepository.findById(assignedUserId);
      if (!targetUser) {
        throw new NotFoundError('Usuário responsável não encontrado');
      }

      if (!canHandleTickets(targetUser.roles)) {
        throw new BadRequestError('O responsável pelo atendimento deve possuir perfil de AGENT ou ADMIN');
      }

      if (!targetUser.active) {
        throw new BadRequestError('Não é possível atribuir um usuário inativo como responsável');
      }
    }

    const updated = await this.ticketsRepository.update(id, { assignedUserId });

    const eventType = assignedUserId ? 'ASSIGNED' : 'UNASSIGNED';
    await this.ticketEventsRepository.create({
      ticketId: id,
      userId: actorUser.id,
      type: eventType,
      metadata: {
        previousAssignedUserId: ticket.assignedUserId,
        newAssignedUserId: assignedUserId,
      },
    });

    return TicketMapper.toDTO(updated);
  }
}
