import { TicketEvent } from '../../domain/entities/ticket-event.js';
import { UserMapper } from './user-mapper.js';

export class TicketEventMapper {
  static toDomain(raw) {
    if (!raw) return null;

    return new TicketEvent({
      id: raw.id,
      ticketId: raw.ticketId,
      userId: raw.userId,
      type: raw.type,
      metadata: raw.metadata,
      createdAt: raw.createdAt,
      user: raw.user ? UserMapper.toDomain(raw.user) : null,
    });
  }

  static toDTO(event) {
    if (!event) return null;

    return {
      id: event.id,
      ticketId: event.ticketId,
      userId: event.userId,
      type: event.type,
      metadata: event.metadata,
      createdAt: event.createdAt,
      user: event.user ? UserMapper.toDTO(event.user) : null,
    };
  }

  static toDTOList(events) {
    if (!Array.isArray(events)) return [];
    return events.map((e) => this.toDTO(e));
  }
}
