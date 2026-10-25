import { describe, expect, it, vi } from 'vitest';
import { PrismaRolesRepository } from '../../../src/infrastructure/database/prisma/repositories/prisma-roles-repository.js';
import { PrismaUserTokensRepository } from '../../../src/infrastructure/database/prisma/repositories/prisma-user-tokens-repository.js';
import { PrismaUsersRepository } from '../../../src/infrastructure/database/prisma/repositories/prisma-users-repository.js';

const rawUser = {
  id: 'user-id',
  name: 'Maria',
  email: 'MARIA@example.com',
  password: null,
  active: true,
  roles: [{ role: { name: 'ADMIN' } }],
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('Prisma repositories', () => {
  it('maps users and builds filtered paginated queries', async () => {
    const prisma = {
      user: {
        findUnique: vi.fn().mockResolvedValue(rawUser),
        create: vi.fn().mockResolvedValue(rawUser),
        update: vi.fn().mockResolvedValue(rawUser),
        count: vi.fn().mockResolvedValue(1),
        findMany: vi.fn().mockResolvedValue([rawUser]),
      },
      userRole: { deleteMany: vi.fn() },
    };
    const repository = new PrismaUsersRepository(prisma);

    expect((await repository.findByEmail(' Maria@Example.com ')).email).toBe('MARIA@example.com');
    expect((await repository.findById('user-id')).id).toBe('user-id');
    await repository.create({ name: 'Maria', email: 'Maria@example.com' });
    await repository.update('user-id', { email: 'New@Example.com', active: false, roleNames: ['USER'] });
    const result = await repository.list({ page: 2, limit: 10, active: true, search: 'Maria' });

    expect(result.meta).toMatchObject({ total: 1, page: 2, limit: 10, totalPages: 1 });
    expect(prisma.user.findMany).toHaveBeenLastCalledWith(expect.objectContaining({
      skip: 10,
      take: 10,
      where: expect.objectContaining({ active: true, OR: expect.any(Array) }),
    }));
    expect(prisma.userRole.deleteMany).toHaveBeenCalledWith({ where: { userId: 'user-id' } });
  });

  it('handles roles and token lifecycle operations', async () => {
    const rawToken = {
      id: 'token-id',
      userId: 'user-id',
      token: 'hash',
      type: 'PASSWORD_RESET',
      expiresAt: new Date(Date.now() + 60_000),
      usedAt: null,
      revokedAt: null,
      createdAt: new Date(),
    };
    const prisma = {
      role: { findMany: vi.fn().mockResolvedValue([{ name: 'ADMIN' }]) },
      userToken: {
        create: vi.fn().mockResolvedValue(rawToken),
        findFirst: vi.fn().mockResolvedValue(rawToken),
        update: vi.fn().mockResolvedValue({ ...rawToken, usedAt: new Date() }),
        updateMany: vi.fn().mockResolvedValue({ count: 1 }),
      },
    };
    const roles = new PrismaRolesRepository(prisma);
    const tokens = new PrismaUserTokensRepository(prisma);

    expect(await roles.findByNames(['ADMIN'])).toEqual([{ name: 'ADMIN' }]);
    expect((await tokens.create(rawToken)).id).toBe('token-id');
    expect((await tokens.findValidToken('hash', 'PASSWORD_RESET')).isValid()).toBe(true);
    expect((await tokens.markAsUsed('token-id')).usedAt).toBeInstanceOf(Date);
    expect(await tokens.revokeAllByUserId('user-id', 'PASSWORD_RESET')).toEqual({ count: 1 });
  });

  it('handles categories, tickets, comments and ticket-events repository operations', async () => {
    const { PrismaCategoriesRepository } = await import('../../../src/infrastructure/database/prisma/repositories/prisma-categories-repository.js');
    const { PrismaTicketsRepository } = await import('../../../src/infrastructure/database/prisma/repositories/prisma-tickets-repository.js');
    const { PrismaCommentsRepository } = await import('../../../src/infrastructure/database/prisma/repositories/prisma-comments-repository.js');
    const { PrismaTicketEventsRepository } = await import('../../../src/infrastructure/database/prisma/repositories/prisma-ticket-events-repository.js');

    const rawCategory = { id: 'c-1', name: 'Software', description: 'Desc', active: true, createdAt: new Date(), updatedAt: new Date() };
    const rawTicket = {
      id: 't-1',
      title: 'Bug',
      description: 'Desc',
      status: 'OPEN',
      priority: 'MEDIUM',
      requesterId: 'u-1',
      categoryId: 'c-1',
      assignedUserId: null,
      dueDate: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      closedAt: null,
      category: rawCategory,
      requester: rawUser,
    };
    const rawComment = { id: 'com-1', ticketId: 't-1', userId: 'u-1', content: 'Msg', createdAt: new Date(), updatedAt: new Date(), user: rawUser };
    const rawEvent = { id: 'ev-1', ticketId: 't-1', userId: 'u-1', type: 'CREATED', metadata: null, createdAt: new Date(), user: rawUser };

    const prisma = {
      category: {
        findUnique: vi.fn().mockResolvedValue(rawCategory),
        findMany: vi.fn().mockResolvedValue([rawCategory]),
        create: vi.fn().mockResolvedValue(rawCategory),
        update: vi.fn().mockResolvedValue(rawCategory),
      },
      ticket: {
        findUnique: vi.fn().mockResolvedValue(rawTicket),
        findMany: vi.fn().mockResolvedValue([rawTicket]),
        count: vi.fn().mockResolvedValue(1),
        create: vi.fn().mockResolvedValue(rawTicket),
        update: vi.fn().mockResolvedValue(rawTicket),
      },
      comment: {
        create: vi.fn().mockResolvedValue(rawComment),
        findMany: vi.fn().mockResolvedValue([rawComment]),
      },
      ticketEvent: {
        create: vi.fn().mockResolvedValue(rawEvent),
        findMany: vi.fn().mockResolvedValue([rawEvent]),
      },
    };

    const categoriesRepo = new PrismaCategoriesRepository(prisma);
    const ticketsRepo = new PrismaTicketsRepository(prisma);
    const commentsRepo = new PrismaCommentsRepository(prisma);
    const eventsRepo = new PrismaTicketEventsRepository(prisma);

    expect((await categoriesRepo.findById('c-1')).name).toBe('Software');
    expect((await categoriesRepo.findByName('Software')).id).toBe('c-1');
    expect(await categoriesRepo.findAll({ active: true, search: 'Soft' })).toHaveLength(1);
    expect(await categoriesRepo.findAll({})).toHaveLength(1);
    expect((await categoriesRepo.create({ name: 'Hardware', description: 'Desc', active: false })).name).toBe('Software');
    expect((await categoriesRepo.update('c-1', { name: 'Software Updated', description: 'New Desc', active: true })).id).toBe('c-1');

    expect((await ticketsRepo.findById('t-1')).id).toBe('t-1');
    expect((await ticketsRepo.create({
      title: 'Bug',
      description: 'Desc',
      requesterId: 'u-1',
      categoryId: 'c-1',
      dueDate: new Date(),
    })).title).toBe('Bug');
    const ticketsList = await ticketsRepo.findMany({
      page: 1,
      limit: 10,
      status: 'OPEN',
      priority: 'MEDIUM',
      categoryId: 'c-1',
      requesterId: 'u-1',
      assignedUserId: 'u-2',
      search: 'Bug',
    });
    expect(ticketsList.data).toHaveLength(1);
    expect((await ticketsRepo.update('t-1', {
      title: 'Bug Fix',
      description: 'Desc Fix',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      categoryId: 'c-1',
      assignedUserId: 'u-2',
      dueDate: new Date(),
      closedAt: new Date(),
    })).id).toBe('t-1');

    expect((await commentsRepo.create({ ticketId: 't-1', userId: 'u-1', content: 'Msg' })).id).toBe('com-1');
    expect(await commentsRepo.findByTicketId('t-1')).toHaveLength(1);

    expect((await eventsRepo.create({ ticketId: 't-1', userId: 'u-1', type: 'CREATED' })).id).toBe('ev-1');
    expect(await eventsRepo.findByTicketId('t-1')).toHaveLength(1);
  });
});
