import { Ticket } from '../../domain/entities/ticket.js';
import { UserMapper } from './user-mapper.js';
import { CategoryMapper } from './category-mapper.js';
import { CommentMapper } from './comment-mapper.js';
import { TicketEventMapper } from './ticket-event-mapper.js';

export class TicketMapper {
  static toDomain(raw) {
    if (!raw) return null;

    return new Ticket({
      id: raw.id,
      title: raw.title,
      description: raw.description,
      status: raw.status,
      priority: raw.priority,
      requesterId: raw.requesterId,
      categoryId: raw.categoryId,
      assignedUserId: raw.assignedUserId,
      dueDate: raw.dueDate,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      closedAt: raw.closedAt,
      requester: raw.requester ? UserMapper.toDomain(raw.requester) : null,
      assignedUser: raw.assignedUser ? UserMapper.toDomain(raw.assignedUser) : null,
      category: raw.category ? CategoryMapper.toDomain(raw.category) : null,
      comments: Array.isArray(raw.comments) ? raw.comments.map((c) => CommentMapper.toDomain(c)) : [],
      events: Array.isArray(raw.events) ? raw.events.map((e) => TicketEventMapper.toDomain(e)) : [],
    });
  }

  static toDTO(ticket) {
    if (!ticket) return null;

    return {
      id: ticket.id,
      title: ticket.title,
      description: ticket.description,
      status: ticket.status,
      priority: ticket.priority,
      requesterId: ticket.requesterId,
      categoryId: ticket.categoryId,
      assignedUserId: ticket.assignedUserId,
      dueDate: ticket.dueDate,
      createdAt: ticket.createdAt,
      updatedAt: ticket.updatedAt,
      closedAt: ticket.closedAt,
      requester: ticket.requester ? UserMapper.toDTO(ticket.requester) : null,
      assignedUser: ticket.assignedUser ? UserMapper.toDTO(ticket.assignedUser) : null,
      category: ticket.category ? CategoryMapper.toDTO(ticket.category) : null,
      comments: ticket.comments ? CommentMapper.toDTOList(ticket.comments) : [],
      events: ticket.events ? TicketEventMapper.toDTOList(ticket.events) : [],
    };
  }

  static toSummaryDTO(ticket) {
    if (!ticket) return null;

    return {
      id: ticket.id,
      title: ticket.title,
      description: ticket.description,
      status: ticket.status,
      priority: ticket.priority,
      requesterId: ticket.requesterId,
      categoryId: ticket.categoryId,
      assignedUserId: ticket.assignedUserId,
      dueDate: ticket.dueDate,
      createdAt: ticket.createdAt,
      updatedAt: ticket.updatedAt,
      closedAt: ticket.closedAt,
      requester: ticket.requester ? UserMapper.toDTO(ticket.requester) : null,
      assignedUser: ticket.assignedUser ? UserMapper.toDTO(ticket.assignedUser) : null,
      category: ticket.category ? CategoryMapper.toDTO(ticket.category) : null,
    };
  }

  static toSummaryDTOList(tickets) {
    if (!Array.isArray(tickets)) return [];
    return tickets.map((t) => this.toSummaryDTO(t));
  }

  static toDTOList(tickets) {
    if (!Array.isArray(tickets)) return [];
    return tickets.map((t) => this.toDTO(t));
  }
}
