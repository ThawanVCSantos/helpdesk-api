import { BasePrismaRepository } from './base-prisma-repository.js';
import { CommentMapper } from '../../../../application/mappers/comment-mapper.js';

export class PrismaCommentsRepository extends BasePrismaRepository {
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
        attachments: { include: { attachment: true } },
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
        attachments: { include: { attachment: true } },
      },
    });

    return rows.map((r) => CommentMapper.toDomain(r));
  }

  async findById(id) {
    const raw = await this.prisma.comment.findUnique({
      where: { id },
      include: {
        user: {
          include: {
            roles: { include: { role: true } },
          },
        },
        attachments: { include: { attachment: true } },
      },
    });

    return CommentMapper.toDomain(raw);
  }
}
