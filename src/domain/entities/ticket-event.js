export class TicketEvent {
  constructor({
    id,
    ticketId,
    userId = null,
    type,
    metadata = null,
    createdAt = new Date(),
    user = null,
  }) {
    this.id = id;
    this.ticketId = ticketId;
    this.userId = userId;
    this.type = type;
    this.metadata = metadata;
    this.createdAt = createdAt;
    this.user = user;
  }
}
