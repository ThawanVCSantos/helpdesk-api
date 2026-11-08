import { BasePrismaRepository } from './base-prisma-repository.js';
import { AttachmentMapper } from '../../../../application/mappers/attachment-mapper.js';

export class PrismaAttachmentsRepository extends BasePrismaRepository {
  async createForTicket({ ticketId, storageKey, fileName, mimeType, size }) {
    const raw = await this.prisma.attachment.create({
      data: {
        storageKey,
        fileName,
        mimeType,
        size,
        tickets: {
          create: {
            ticketId,
          },
        },
      },
    });

    return AttachmentMapper.toDomain(raw);
  }

  async createForComment({ commentId, storageKey, fileName, mimeType, size }) {
    const raw = await this.prisma.attachment.create({
      data: {
        storageKey,
        fileName,
        mimeType,
        size,
        comments: {
          create: {
            commentId,
          },
        },
      },
    });

    return AttachmentMapper.toDomain(raw);
  }

  async findById(id) {
    const raw = await this.prisma.attachment.findUnique({
      where: { id },
      include: {
        tickets: true,
        comments: {
          include: {
            comment: true,
          },
        },
      },
    });

    return AttachmentMapper.toDomain(raw);
  }

  async findByTicketId(ticketId) {
    const rows = await this.prisma.attachment.findMany({
      where: {
        tickets: {
          some: {
            ticketId,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return rows.map((row) => AttachmentMapper.toDomain(row));
  }

  async findByCommentId(commentId) {
    const rows = await this.prisma.attachment.findMany({
      where: {
        comments: {
          some: {
            commentId,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return rows.map((row) => AttachmentMapper.toDomain(row));
  }

  async delete(id) {
    await this.prisma.ticketAttachment.deleteMany({
      where: { attachmentId: id },
    });

    await this.prisma.commentAttachment.deleteMany({
      where: { attachmentId: id },
    });

    return this.prisma.attachment.delete({
      where: { id },
    });
  }
}
