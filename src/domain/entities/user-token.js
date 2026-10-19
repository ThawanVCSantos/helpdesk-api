export class UserToken {
  constructor({ id, userId, token, type, expiresAt, usedAt = null, revokedAt = null, createdAt = new Date() }) {
    this.id = id;
    this.userId = userId;
    this.token = token;
    this.type = type;
    this.expiresAt = expiresAt;
    this.usedAt = usedAt;
    this.revokedAt = revokedAt;
    this.createdAt = createdAt;
  }

  isExpired() {
    return new Date() > new Date(this.expiresAt);
  }

  isUsed() {
    return Boolean(this.usedAt);
  }

  isRevoked() {
    return Boolean(this.revokedAt);
  }

  isValid() {
    return !this.isExpired() && !this.isUsed() && !this.isRevoked();
  }
}
