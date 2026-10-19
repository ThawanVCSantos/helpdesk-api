import { db } from '../prisma-client.js';
import { UserTokenMapper } from '../../../../application/mappers/user-token-mapper.js';

export class PrismaUserTokensRepository {
  constructor(prisma = db) {
    this.prisma = prisma;
  }

  async create({ userId, token, type, expiresAt }) {
    const raw = await this.prisma.userToken.create({
      data: {
        userId,
        token,
        type,
        expiresAt,
      },
    });

    return UserTokenMapper.toDomain(raw);
  }

  async findValidToken(hashedToken, types) {
    const tokenTypes = Array.isArray(types) ? types : [types];

    const raw = await this.prisma.userToken.findFirst({
      where: {
        token: hashedToken,
        type: { in: tokenTypes },
        usedAt: null,
        revokedAt: null,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    return UserTokenMapper.toDomain(raw);
  }

  async markAsUsed(id) {
    const raw = await this.prisma.userToken.update({
      where: { id },
      data: {
        usedAt: new Date(),
      },
    });

    return UserTokenMapper.toDomain(raw);
  }

  async revokeAllByUserId(userId, type) {
    return this.prisma.userToken.updateMany({
      where: {
        userId,
        type,
        usedAt: null,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });
  }
}

export const userTokensRepository = new PrismaUserTokensRepository();
