import { BasePrismaRepository } from './base-prisma-repository.js';
import { TicketEventMapper } from '../../../../application/mappers/ticket-event-mapper.js';

export class PrismaTicketEventsRepository extends BasePrismaRepository {
  async create({ ticketId, userId = null, type, metadata = null }) {
    const raw = await this.prisma.ticketEvent.create({
      data: {
        ticketId,
        userId,
        type,
        metadata,
      },
      include: {
        user: {
          include: {
            roles: { include: { role: true } },
          },
        },
      },
    });

    return TicketEventMapper.toDomain(raw);
  }

  async findByTicketId(ticketId) {
    const rows = await this.prisma.ticketEvent.findMany({
      where: { ticketId },
      orderBy: { createdAt: 'asc' },
      include: {
        user: {
          include: {
            roles: { include: { role: true } },
          },
        },
      },
    });

    return rows.map((r) => TicketEventMapper.toDomain(r));
  }
}
