import { describe, expect, it, vi } from 'vitest';
import { CreateTicket } from '../../../../../src/application/use-cases/tickets/create-ticket.js';
import { ListTickets } from '../../../../../src/application/use-cases/tickets/list-tickets.js';
import { GetTicketById } from '../../../../../src/application/use-cases/tickets/get-ticket-by-id.js';
import { UpdateTicket } from '../../../../../src/application/use-cases/tickets/update-ticket.js';
import { AssignTicket } from '../../../../../src/application/use-cases/tickets/assign-ticket.js';
import { ChangeTicketStatus } from '../../../../../src/application/use-cases/tickets/change-ticket-status.js';
import { CreateComment } from '../../../../../src/application/use-cases/comments/create-comment.js';
import { ListComments } from '../../../../../src/application/use-cases/comments/list-comments.js';
import { ListTicketEvents } from '../../../../../src/application/use-cases/tickets/list-ticket-events.js';

import { BadRequestError } from '../../../../../src/domain/errors/bad-request-error.js';
import { ForbiddenError } from '../../../../../src/domain/errors/forbidden-error.js';
import { NotFoundError } from '../../../../../src/domain/errors/not-found-error.js';
import { Ticket } from '../../../../../src/domain/entities/ticket.js';
import { Category } from '../../../../../src/domain/entities/category.js';
import { Comment } from '../../../../../src/domain/entities/comment.js';
import { TicketEvent } from '../../../../../src/domain/entities/ticket-event.js';
import { User } from '../../../../../src/domain/entities/user.js';

describe('Tickets & Business Rules Use Cases', () => {
  const userCommon = { id: 'user-1', roles: ['USER'] };
  const userAgent = { id: 'agent-1', roles: ['AGENT'] };

  it('creates ticket successfully and records CREATED event', async () => {
    const categoriesRepository = {
      findById: vi.fn().mockResolvedValue(new Category({ id: 'cat-1', name: 'Software', active: true })),
    };
    const ticketsRepository = {
      create: vi.fn().mockImplementation(async (data) => new Ticket({ id: 'ticket-1', ...data })),
    };
    const ticketEventsRepository = {
      create: vi.fn().mockResolvedValue({ id: 'event-1' }),
    };

    const useCase = new CreateTicket({
      ticketsRepository,
      categoriesRepository,
      ticketEventsRepository,
    });

    const result = await useCase.execute({
      title: 'Sistema fora do ar',
      description: 'Erro 500 no portal',
      requesterId: userCommon.id,
      categoryId: 'cat-1',
    });

    expect(result.id).toBe('ticket-1');
    expect(ticketEventsRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        ticketId: 'ticket-1',
        type: 'CREATED',
        userId: userCommon.id,
      })
    );
  });

  it('rejects ticket creation with inactive category', async () => {
    const categoriesRepository = {
      findById: vi.fn().mockResolvedValue(new Category({ id: 'cat-1', name: 'Legacy', active: false })),
    };
    const ticketsRepository = { create: vi.fn() };
    const ticketEventsRepository = { create: vi.fn() };

    const useCase = new CreateTicket({
      ticketsRepository,
      categoriesRepository,
      ticketEventsRepository,
    });

    await expect(
      useCase.execute({
        title: 'Chamado teste',
        description: 'Desc',
        requesterId: userCommon.id,
        categoryId: 'cat-1',
      })
    ).rejects.toThrow(BadRequestError);
  });

  it('restricts common user to view only their own tickets', async () => {
    const ticketsRepository = {
      findMany: vi.fn().mockResolvedValue({ data: [], meta: { total: 0 } }),
    };
    const useCase = new ListTickets({ ticketsRepository });

    await useCase.execute({ user: userCommon, requesterId: 'other-user' });

    expect(ticketsRepository.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ requesterId: userCommon.id })
    );
  });

  it('throws ForbiddenError if common user views ticket of another user', async () => {
    const ticketsRepository = {
      findById: vi.fn().mockResolvedValue(new Ticket({ id: 't-1', requesterId: 'another-user' })),
    };
    const useCase = new GetTicketById({ ticketsRepository });

    await expect(useCase.execute({ id: 't-1', user: userCommon })).rejects.toThrow(ForbiddenError);
  });

  it('assigns ticket to an active AGENT or ADMIN and records ASSIGNED event', async () => {
    const ticket = new Ticket({ id: 't-1', requesterId: userCommon.id, status: 'OPEN' });
    const agentUser = new User({ id: 'agent-1', roles: ['AGENT'], active: true });

    const ticketsRepository = {
      findById: vi.fn().mockResolvedValue(ticket),
      update: vi.fn().mockImplementation(async (id, data) => new Ticket({ ...ticket, ...data })),
    };
    const usersRepository = {
      findById: vi.fn().mockResolvedValue(agentUser),
    };
    const ticketEventsRepository = {
      create: vi.fn().mockResolvedValue({ id: 'ev-1' }),
    };

    const useCase = new AssignTicket({
      ticketsRepository,
      usersRepository,
      ticketEventsRepository,
    });

    const result = await useCase.execute({
      id: 't-1',
      actorUser: userAgent,
      assignedUserId: 'agent-1',
    });

    expect(result.assignedUserId).toBe('agent-1');
    expect(ticketEventsRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'ASSIGNED', ticketId: 't-1' })
    );
  });

  it('rejects assigning ticket to a common USER', async () => {
    const ticket = new Ticket({ id: 't-1', requesterId: userCommon.id });
    const standardUser = new User({ id: 'std-1', roles: ['USER'], active: true });

    const ticketsRepository = {
      findById: vi.fn().mockResolvedValue(ticket),
      update: vi.fn().mockImplementation(async (id, data) => new Ticket({ ...ticket, ...data })),
    };
    const usersRepository = { findById: vi.fn().mockResolvedValue(standardUser) };
    const ticketEventsRepository = { create: vi.fn() };

    const useCase = new AssignTicket({
      ticketsRepository,
      usersRepository,
      ticketEventsRepository,
    });

    await expect(
      useCase.execute({ id: 't-1', actorUser: userAgent, assignedUserId: 'std-1' })
    ).rejects.toThrow(BadRequestError);

    // Unassign ticket
    const unassignResult = await useCase.execute({ id: 't-1', actorUser: userAgent, assignedUserId: null });
    expect(unassignResult.assignedUserId).toBeNull();

    // Assign on closed ticket throws BadRequestError
    ticketsRepository.findById.mockResolvedValueOnce(new Ticket({ id: 't-1', status: 'CLOSED' }));
    await expect(useCase.execute({ id: 't-1', actorUser: userAgent, assignedUserId: null })).rejects.toThrow(BadRequestError);

    // Assign to non-existent user throws NotFoundError
    usersRepository.findById.mockResolvedValueOnce(null);
    await expect(useCase.execute({ id: 't-1', actorUser: userAgent, assignedUserId: 'unknown' })).rejects.toThrow(NotFoundError);
  });

  it('changes ticket status to CLOSED and sets closedAt', async () => {
    const ticket = new Ticket({ id: 't-1', requesterId: userCommon.id, status: 'IN_PROGRESS' });
    const ticketsRepository = {
      findById: vi.fn().mockResolvedValue(ticket),
      update: vi.fn().mockImplementation(async (id, data) => new Ticket({ ...ticket, ...data })),
    };
    const ticketEventsRepository = { create: vi.fn() };

    const useCase = new ChangeTicketStatus({ ticketsRepository, ticketEventsRepository });
    const result = await useCase.execute({ id: 't-1', actorUser: userAgent, status: 'CLOSED' });

    expect(result.status).toBe('CLOSED');
    expect(result.closedAt).toBeDefined();
    expect(ticketEventsRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'STATUS_CHANGED' })
    );
  });

  it('adds comment and registers COMMENT_ADDED event', async () => {
    const ticket = new Ticket({ id: 't-1', requesterId: userCommon.id, status: 'OPEN' });
    const ticketsRepository = { findById: vi.fn().mockResolvedValue(ticket) };
    const commentsRepository = {
      create: vi.fn().mockImplementation(async (d) => new Comment({ id: 'c-1', ...d })),
    };
    const ticketEventsRepository = { create: vi.fn() };

    const useCase = new CreateComment({
      ticketsRepository,
      commentsRepository,
      ticketEventsRepository,
    });

    const result = await useCase.execute({
      ticketId: 't-1',
      user: userCommon,
      content: 'Aguardando atualização.',
    });

    expect(result.id).toBe('c-1');
    expect(ticketEventsRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'COMMENT_ADDED' })
    );
  });

  it('lists comments and ticket events', async () => {
    const ticket = new Ticket({ id: 't-1', requesterId: userCommon.id });
    const ticketsRepository = { findById: vi.fn().mockResolvedValue(ticket) };
    const commentsRepository = {
      findByTicketId: vi.fn().mockResolvedValue([
        new Comment({ id: 'c-1', ticketId: 't-1', userId: userCommon.id, content: 'Olá' }),
      ]),
    };
    const ticketEventsRepository = {
      findByTicketId: vi.fn().mockResolvedValue([
        new TicketEvent({ id: 'ev-1', ticketId: 't-1', type: 'CREATED' }),
      ]),
    };

    const listComments = new ListComments({ ticketsRepository, commentsRepository });
    const comments = await listComments.execute({ ticketId: 't-1', user: userCommon });
    expect(comments).toHaveLength(1);

    const listEvents = new ListTicketEvents({ ticketsRepository, ticketEventsRepository });
    const events = await listEvents.execute({ ticketId: 't-1', user: userCommon });
    expect(events).toHaveLength(1);
  });

  it('updates ticket and registers audit events', async () => {
    const ticket = new Ticket({
      id: 't-1',
      title: 'Antigo',
      priority: 'LOW',
      requesterId: userCommon.id,
      status: 'OPEN',
    });
    const ticketsRepository = {
      findById: vi.fn().mockResolvedValue(ticket),
      update: vi.fn().mockImplementation(async (id, data) => new Ticket({ ...ticket, ...data })),
    };
    const categoriesRepository = { findById: vi.fn() };
    const ticketEventsRepository = { create: vi.fn() };

    const useCase = new UpdateTicket({
      ticketsRepository,
      categoriesRepository,
      ticketEventsRepository,
    });

    const result = await useCase.execute({
      id: 't-1',
      user: userAgent,
      priority: 'HIGH',
    });

    expect(result.priority).toBe('HIGH');
    expect(ticketEventsRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'PRIORITY_CHANGED' })
    );

    // Should throw NotFoundError if ticket does not exist
    ticketsRepository.findById.mockResolvedValueOnce(null);
    await expect(useCase.execute({ id: 'invalid', user: userAgent, priority: 'LOW' })).rejects.toThrow(NotFoundError);
  });
});
