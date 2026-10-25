export class Ticket {
  constructor({
    id,
    title,
    description,
    status = 'OPEN',
    priority = 'MEDIUM',
    requesterId,
    categoryId,
    assignedUserId = null,
    dueDate = null,
    createdAt = new Date(),
    updatedAt = new Date(),
    closedAt = null,
    requester = null,
    assignedUser = null,
    category = null,
    comments = [],
    events = [],
  }) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.status = status;
    this.priority = priority;
    this.requesterId = requesterId;
    this.categoryId = categoryId;
    this.assignedUserId = assignedUserId;
    this.dueDate = dueDate;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.closedAt = closedAt;
    this.requester = requester;
    this.assignedUser = assignedUser;
    this.category = category;
    this.comments = comments;
    this.events = events;
  }
}
