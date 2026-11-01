import { db } from '../prisma-client.js';
import { NotificationMapper } from '../../../../application/mappers/notification-mapper.js';
import { MAX_NOTIFICATION_ATTEMPTS } from '../../../../shared/constants/notifications.js';

export class PrismaNotificationsRepository {
  constructor(prisma = db) {
    this.prisma = prisma;
  }

  async create({ userId, ticketId = null, type, channel, status = 'PENDING' }) {
    const deliveredAt = status === 'DELIVERED' ? new Date() : null;
    const raw = await this.prisma.notification.create({
      data: {
        userId,
        ticketId,
        type,
        channel,
        status,
        deliveredAt,
      },
      include: {
        ticket: true,
      },
    });

    return NotificationMapper.toDomain(raw);
  }

  async createMany(items) {
    if (!items || items.length === 0) return [];

    await this.prisma.notification.createMany({
      data: items.map((item) => {
        const status = item.status || 'PENDING';
        return {
          userId: item.userId,
          ticketId: item.ticketId || null,
          type: item.type,
          channel: item.channel,
          status,
          deliveredAt: status === 'DELIVERED' ? (item.deliveredAt || new Date()) : null,
        };
      }),
    });

    return items;
  }

  async findById(id) {
    const raw = await this.prisma.notification.findUnique({
      where: { id },
      include: {
        ticket: true,
        user: true,
      },
    });

    return NotificationMapper.toDomain(raw);
  }

  async findByUserId(userId, { unreadOnly = false, channel = 'IN_APP', page = 1, limit = 20 } = {}) {
    const skip = (page - 1) * limit;
    const where = {
      userId,
      ...(channel ? { channel } : {}),
      ...(unreadOnly ? { readAt: null } : {}),
    };

    const [rows, total] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          ticket: true,
        },
      }),
      this.prisma.notification.count({ where }),
    ]);

    return {
      data: rows.map((row) => NotificationMapper.toDomain(row)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async countUnread(userId, channel = 'IN_APP') {
    return this.prisma.notification.count({
      where: {
        userId,
        channel,
        readAt: null,
      },
    });
  }

  async markAsRead(id, userId) {
    const now = new Date();
    const updated = await this.prisma.notification.updateMany({
      where: {
        id,
        userId,
        readAt: null,
      },
      data: {
        readAt: now,
      },
    });

    if (updated.count === 0) return null;
    return this.findById(id);
  }

  async markAllAsRead(userId, channel = 'IN_APP') {
    const now = new Date();
    const updated = await this.prisma.notification.updateMany({
      where: {
        userId,
        channel,
        readAt: null,
      },
      data: {
        readAt: now,
      },
    });

    return updated.count;
  }

  async findPendingEmails({ limit = 20, maxAttempts = MAX_NOTIFICATION_ATTEMPTS } = {}) {
    const rows = await this.prisma.notification.findMany({
      where: {
        channel: 'EMAIL',
        status: { in: ['PENDING', 'FAILED'] },
        attempts: { lt: maxAttempts },
      },
      take: limit,
      orderBy: [
        { attempts: 'asc' },
        { createdAt: 'desc' },
      ],
      include: {
        user: true,
        ticket: {
          include: {
            requester: true,
            assignedUser: true,
          },
        },
      },
    });

    return rows.map((row) => NotificationMapper.toDomain(row));
  }

  async updateStatus({ id, status, attempts, lastError = null, deliveredAt = null }) {
    const raw = await this.prisma.notification.update({
      where: { id },
      data: {
        status,
        ...(attempts !== undefined ? { attempts } : {}),
        lastError,
        deliveredAt,
      },
    });

    return NotificationMapper.toDomain(raw);
  }
}
