import { BadRequestError } from '../../../domain/errors/bad-request-error.js';
import { NotFoundError } from '../../../domain/errors/not-found-error.js';
import { TicketMapper } from '../../mappers/ticket-mapper.js';

export class CreateTicket {
  constructor({ ticketsRepository, categoriesRepository, ticketEventsRepository }) {
    this.ticketsRepository = ticketsRepository;
    this.categoriesRepository = categoriesRepository;
    this.ticketEventsRepository = ticketEventsRepository;
  }

  async execute({ title, description, priority = 'MEDIUM', requesterId, categoryId, dueDate = null }) {
    const category = await this.categoriesRepository.findById(categoryId);
    if (!category) {
      throw new NotFoundError('Categoria informada não encontrada');
    }

    if (!category.active) {
      throw new BadRequestError('Categorias inativas não podem ser utilizadas na abertura de novos chamados');
    }

    const createdTicket = await this.ticketsRepository.create({
      title,
      description,
      priority,
      requesterId,
      categoryId,
      dueDate,
    });

    await this.ticketEventsRepository.create({
      ticketId: createdTicket.id,
      userId: requesterId,
      type: 'CREATED',
      metadata: {
        title: createdTicket.title,
        priority: createdTicket.priority,
        categoryId: createdTicket.categoryId,
      },
    });

    return TicketMapper.toDTO(createdTicket);
  }
}
