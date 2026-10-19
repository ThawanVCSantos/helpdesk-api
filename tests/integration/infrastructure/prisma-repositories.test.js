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
});
