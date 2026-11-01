export class Notification {
  constructor({
    id,
    userId,
    ticketId = null,
    type,
    channel,
    status = 'PENDING',
    attempts = 0,
    lastError = null,
    deliveredAt = null,
    readAt = null,
    createdAt = new Date(),
    updatedAt = new Date(),
    user = null,
    ticket = null,
  }) {
    this.id = id;
    this.userId = userId;
    this.ticketId = ticketId;
    this.type = type;
    this.channel = channel;
    this.status = status;
    this.attempts = attempts;
    this.lastError = lastError;
    this.deliveredAt = deliveredAt;
    this.readAt = readAt;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.user = user;
    this.ticket = ticket;
  }
}
