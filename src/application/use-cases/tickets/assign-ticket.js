import { BadRequestError } from '../../../domain/errors/bad-request-error.js';
import { NotFoundError } from '../../../domain/errors/not-found-error.js';
import { TicketMapper } from '../../mappers/ticket-mapper.js';
import { canHandleTickets } from '../../../shared/utils/roles.js';
import { logger } from '../../../infrastructure/logging/logger.js';

export class AssignTicket {
  constructor({ ticketsRepository, usersRepository, ticketEventsRepository, dispatchTicketNotifications = null }) {
    this.ticketsRepository = ticketsRepository;
    this.usersRepository = usersRepository;
    this.ticketEventsRepository = ticketEventsRepository;
    this.dispatchTicketNotifications = dispatchTicketNotifications;
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

    if (this.dispatchTicketNotifications) {
      try {
        await this.dispatchTicketNotifications.execute({
          ticket: updated,
          actorUserId: actorUser.id,
          type: 'TICKET_ASSIGNED',
        });
      } catch (error) {
        logger.error('Failed to dispatch ticket notifications', {
          ticketId: id,
          actorUserId: actorUser.id,
          type: 'TICKET_ASSIGNED',
          error: error.message,
        });
      }
    }

    return TicketMapper.toDTO(updated);
  }
}
