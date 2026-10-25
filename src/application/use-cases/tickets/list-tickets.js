import { TicketMapper } from '../../mappers/ticket-mapper.js';
import { isUserOnly } from '../../../shared/utils/roles.js';

export class ListTickets {
  constructor({ ticketsRepository }) {
    this.ticketsRepository = ticketsRepository;
  }

  async execute({
    user,
    page = 1,
    limit = 10,
    status,
    priority,
    categoryId,
    requesterId,
    assignedUserId,
    search,
  } = {}) {
    const userOnly = isUserOnly(user.roles);

    const effectiveRequesterId = userOnly ? user.id : requesterId;

    const result = await this.ticketsRepository.findMany({
      page,
      limit,
      status,
      priority,
      categoryId,
      requesterId: effectiveRequesterId,
      assignedUserId,
      search,
    });

    return {
      data: TicketMapper.toSummaryDTOList(result.data),
      meta: result.meta,
    };
  }
}
