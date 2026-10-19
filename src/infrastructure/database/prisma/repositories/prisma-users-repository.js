import { db } from '../prisma-client.js';
import { UserMapper } from '../../../../application/mappers/user-mapper.js';

export class PrismaUsersRepository {
  constructor(prisma = db) {
    this.prisma = prisma;
  }

  async findByEmail(email) {
    const raw = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: {
        roles: {
          include: { role: true },
        },
      },
    });

    return UserMapper.toDomain(raw);
  }

  async findById(id) {
    const raw = await this.prisma.user.findUnique({
      where: { id },
      include: {
        roles: {
          include: { role: true },
        },
      },
    });

    return UserMapper.toDomain(raw);
  }

  async create({ name, email, password = null, active = false, roleNames = ['USER'] }) {
    const raw = await this.prisma.user.create({
      data: {
        name,
        email: email.toLowerCase().trim(),
        password,
        active,
        roles: {
          create: roleNames.map((roleName) => ({
            role: {
              connect: { name: roleName },
            },
          })),
        },
      },
      include: {
        roles: {
          include: { role: true },
        },
      },
    });

    return UserMapper.toDomain(raw);
  }

  async update(id, { name, email, password, active, roleNames }) {
    const data = {};
    if (name !== undefined) data.name = name;
    if (email !== undefined) data.email = email.toLowerCase().trim();
    if (password !== undefined) data.password = password;
    if (active !== undefined) data.active = active;

    if (roleNames && Array.isArray(roleNames)) {
      await this.prisma.userRole.deleteMany({
        where: { userId: id },
      });

      data.roles = {
        create: roleNames.map((roleName) => ({
          role: {
            connect: { name: roleName },
          },
        })),
      };
    }

    const raw = await this.prisma.user.update({
      where: { id },
      data,
      include: {
        roles: {
          include: { role: true },
        },
      },
    });

    return UserMapper.toDomain(raw);
  }

  async list({ page = 1, limit = 20, active, search } = {}) {
    const skip = (page - 1) * limit;
    const where = {};

    if (typeof active === 'boolean') {
      where.active = active;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [total, rawUsers] = await Promise.all([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          roles: {
            include: { role: true },
          },
        },
      }),
    ]);

    return {
      data: rawUsers.map((raw) => UserMapper.toDomain(raw)),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }
}

export const usersRepository = new PrismaUsersRepository();
