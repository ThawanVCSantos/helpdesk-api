import { db } from '../prisma-client.js';
import { TicketMapper } from '../../../../application/mappers/ticket-mapper.js';

export class PrismaTicketsRepository {
  constructor(prisma = db) {
    this.prisma = prisma;
  }

  async findById(id) {
    const raw = await this.prisma.ticket.findUnique({
      where: { id },
      include: {
        requester: {
          include: { roles: { include: { role: true } } },
        },
        assignedUser: {
          include: { roles: { include: { role: true } } },
        },
        category: true,
        comments: {
          orderBy: { createdAt: 'asc' },
          include: {
            user: { include: { roles: { include: { role: true } } } },
          },
        },
        events: {
          orderBy: { createdAt: 'asc' },
          include: {
            user: { include: { roles: { include: { role: true } } } },
          },
        },
      },
    });

    return TicketMapper.toDomain(raw);
  }

  async create({ title, description, priority = 'MEDIUM', requesterId, categoryId, dueDate = null }) {
    const raw = await this.prisma.ticket.create({
      data: {
        title: title.trim(),
        description: description.trim(),
        status: 'OPEN',
        priority,
        requesterId,
        categoryId,
        dueDate: dueDate ? new Date(dueDate) : null,
      },
      include: {
        requester: {
          include: { roles: { include: { role: true } } },
        },
        category: true,
      },
    });

    return TicketMapper.toDomain(raw);
  }

  async findMany({
    page = 1,
    limit = 10,
    status,
    priority,
    categoryId,
    requesterId,
    assignedUserId,
    search,
  } = {}) {
    const skip = (page - 1) * limit;
    const where = {};

    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (categoryId) where.categoryId = categoryId;
    if (requesterId) where.requesterId = requesterId;
    if (assignedUserId) where.assignedUserId = assignedUserId;

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [total, rows] = await Promise.all([
      this.prisma.ticket.count({ where }),
      this.prisma.ticket.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          requester: {
            include: { roles: { include: { role: true } } },
          },
          assignedUser: {
            include: { roles: { include: { role: true } } },
          },
          category: true,
        },
      }),
    ]);

    return {
      data: rows.map((r) => TicketMapper.toDomain(r)),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async update(id, data) {
    const updateData = {};
    if (data.title !== undefined) updateData.title = data.title.trim();
    if (data.description !== undefined) updateData.description = data.description.trim();
    if (data.status !== undefined) updateData.status = data.status;
    if (data.priority !== undefined) updateData.priority = data.priority;
    if (data.categoryId !== undefined) updateData.categoryId = data.categoryId;
    if (data.assignedUserId !== undefined) updateData.assignedUserId = data.assignedUserId;
    if (data.dueDate !== undefined) updateData.dueDate = data.dueDate ? new Date(data.dueDate) : null;
    if (data.closedAt !== undefined) updateData.closedAt = data.closedAt ? new Date(data.closedAt) : null;

    const raw = await this.prisma.ticket.update({
      where: { id },
      data: updateData,
      include: {
        requester: {
          include: { roles: { include: { role: true } } },
        },
        assignedUser: {
          include: { roles: { include: { role: true } } },
        },
        category: true,
      },
    });

    return TicketMapper.toDomain(raw);
  }
}
