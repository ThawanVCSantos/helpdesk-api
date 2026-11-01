export class Comment {
  constructor({
    id,
    ticketId,
    userId,
    content,
    createdAt = new Date(),
    updatedAt = new Date(),
    user = null,
    attachments = [],
  }) {
    this.id = id;
    this.ticketId = ticketId;
    this.userId = userId;
    this.content = content;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.user = user;
    this.attachments = attachments;
  }
}
