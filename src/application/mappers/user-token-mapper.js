import { UserToken } from '../../domain/entities/user-token.js';

export class UserTokenMapper {
  static toDomain(raw) {
    if (!raw) return null;

    return new UserToken({
      id: raw.id,
      userId: raw.userId,
      token: raw.token,
      type: raw.type,
      expiresAt: raw.expiresAt,
      usedAt: raw.usedAt,
      revokedAt: raw.revokedAt,
      createdAt: raw.createdAt,
    });
  }
}
