import { db } from '../prisma-client.js';
import { TicketEventMapper } from '../../../../application/mappers/ticket-event-mapper.js';

export class PrismaTicketEventsRepository {
  constructor(prisma = db) {
    this.prisma = prisma;
  }

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
