import { describe, expect, it } from 'vitest';
import { TicketMapper } from '../../../../src/application/mappers/ticket-mapper.js';
import { Ticket } from '../../../../src/domain/entities/ticket.js';

describe('TicketMapper', () => {
  it('maps ticket to full detail DTO with comments and events', () => {
    const ticket = new Ticket({
      id: 'ticket-1',
      title: 'Ticket title',
      description: 'Ticket description',
      status: 'OPEN',
      priority: 'HIGH',
      requesterId: 'user-1',
      categoryId: 'cat-1',
      comments: [{ id: 'comm-1', content: 'test comment' }],
      events: [{ id: 'evt-1', type: 'CREATED' }],
    });

    const dto = TicketMapper.toDTO(ticket);
    expect(dto.id).toBe('ticket-1');
    expect(dto).toHaveProperty('comments');
    expect(dto).toHaveProperty('events');
    expect(dto.comments).toHaveLength(1);
    expect(dto.events).toHaveLength(1);
  });

  it('maps ticket to summary DTO without comments and events', () => {
    const ticket = new Ticket({
      id: 'ticket-1',
      title: 'Ticket title',
      description: 'Ticket description',
      status: 'OPEN',
      priority: 'HIGH',
      requesterId: 'user-1',
      categoryId: 'cat-1',
      comments: [{ id: 'comm-1', content: 'test comment' }],
      events: [{ id: 'evt-1', type: 'CREATED' }],
    });

    const summaryDto = TicketMapper.toSummaryDTO(ticket);
    expect(summaryDto.id).toBe('ticket-1');
    expect(summaryDto).not.toHaveProperty('comments');
    expect(summaryDto).not.toHaveProperty('events');

    const summaryList = TicketMapper.toSummaryDTOList([ticket]);
    expect(summaryList).toHaveLength(1);
    expect(summaryList[0]).not.toHaveProperty('comments');
    expect(summaryList[0]).not.toHaveProperty('events');

    expect(TicketMapper.toSummaryDTO(null)).toBeNull();
    expect(TicketMapper.toSummaryDTOList(null)).toEqual([]);
  });
});
