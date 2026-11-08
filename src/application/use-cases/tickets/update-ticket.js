import { BadRequestError } from '../../../domain/errors/bad-request-error.js';
import { ForbiddenError } from '../../../domain/errors/forbidden-error.js';
import { NotFoundError } from '../../../domain/errors/not-found-error.js';
import { TicketMapper } from '../../mappers/ticket-mapper.js';
import { isUserOnly } from '../../../shared/utils/roles.js';

export class UpdateTicket {
  constructor({
    ticketsRepository,
    categoriesRepository,
    ticketEventsRepository,
    dispatchTicketNotifications,
    transactionRunner,
  }) {
    this.ticketsRepository = ticketsRepository;
    this.categoriesRepository = categoriesRepository;
    this.ticketEventsRepository = ticketEventsRepository;
    this.dispatchTicketNotifications = dispatchTicketNotifications;
    this.transactionRunner = transactionRunner;
  }

  async execute({ id, user, title, description, priority, categoryId, dueDate }) {
    const ticket = await this.ticketsRepository.findById(id);
    if (!ticket) {
      throw new NotFoundError('Chamado não encontrado');
    }

    if (ticket.status === 'CLOSED') {
      throw new BadRequestError('Chamados com status CLOSED não podem ser editados');
    }

    if (isUserOnly(user.roles)) {
      if (ticket.requesterId !== user.id) {
        throw new ForbiddenError('Você não tem permissão para editar este chamado');
      }
    }

    if (categoryId && categoryId !== ticket.categoryId) {
      const category = await this.categoriesRepository.findById(categoryId);
      if (!category) {
        throw new NotFoundError('Categoria informada não encontrada');
      }
      if (!category.active) {
        throw new BadRequestError('Categorias inativas não podem ser vinculadas a chamados');
      }
    }

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (priority !== undefined) updateData.priority = priority;
    if (categoryId !== undefined) updateData.categoryId = categoryId;
    if (dueDate !== undefined) updateData.dueDate = dueDate;

    const updated = await this.transactionRunner.run(async () => {
      const updatedTicket = await this.ticketsRepository.update(id, updateData);

      if (priority && priority !== ticket.priority) {
        await this.ticketEventsRepository.create({
          ticketId: id,
          userId: user.id,
          type: 'PRIORITY_CHANGED',
          metadata: { oldPriority: ticket.priority, newPriority: priority },
        });

        if (this.dispatchTicketNotifications) {
          await this.dispatchTicketNotifications.execute({
            ticket: updatedTicket,
            actorUserId: user.id,
            type: 'PRIORITY_CHANGED',
          });
        }
      }

      if (categoryId && categoryId !== ticket.categoryId) {
        await this.ticketEventsRepository.create({
          ticketId: id,
          userId: user.id,
          type: 'CATEGORY_CHANGED',
          metadata: { oldCategoryId: ticket.categoryId, newCategoryId: categoryId },
        });
      }

      if (dueDate !== undefined && String(dueDate) !== String(ticket.dueDate)) {
        await this.ticketEventsRepository.create({
          ticketId: id,
          userId: user.id,
          type: 'DUE_DATE_CHANGED',
          metadata: { oldDueDate: ticket.dueDate, newDueDate: dueDate },
        });
      }

      return updatedTicket;
    });

    return TicketMapper.toDTO(updated);
  }
}
