import { db } from '../prisma-client.js';
import { CommentMapper } from '../../../../application/mappers/comment-mapper.js';

export class PrismaCommentsRepository {
  constructor(prisma = db) {
    this.prisma = prisma;
  }

  async create({ ticketId, userId, content }) {
    const raw = await this.prisma.comment.create({
      data: {
        ticketId,
        userId,
        content: content.trim(),
      },
      include: {
        user: {
          include: {
            roles: { include: { role: true } },
          },
        },
      },
    });

    return CommentMapper.toDomain(raw);
  }

  async findByTicketId(ticketId) {
    const rows = await this.prisma.comment.findMany({
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

    return rows.map((r) => CommentMapper.toDomain(r));
  }
}
