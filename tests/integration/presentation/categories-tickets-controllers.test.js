import { describe, expect, it, vi } from 'vitest';
import { CategoriesController } from '../../../src/presentation/http/controllers/categories-controller.js';
import { TicketsController } from '../../../src/presentation/http/controllers/tickets-controller.js';

const response = () => ({
  status: vi.fn().mockReturnThis(),
  json: vi.fn().mockReturnThis(),
  send: vi.fn().mockReturnThis(),
});

describe('Categories and Tickets HTTP controllers', () => {
  it('maps category controller requests', async () => {
    const res = response();
    const next = vi.fn();
    const controller = new CategoriesController({
      createCategoryUseCase: { execute: vi.fn().mockResolvedValue({ id: 'cat-1' }) },
      listCategoriesUseCase: { execute: vi.fn().mockResolvedValue([{ id: 'cat-1' }]) },
      getCategoryByIdUseCase: { execute: vi.fn().mockResolvedValue({ id: 'cat-1' }) },
      updateCategoryUseCase: { execute: vi.fn().mockResolvedValue({ id: 'cat-1' }) },
    });

    await controller.create({ body: { name: 'Hardware' } }, res, next);
    expect(res.status).toHaveBeenCalledWith(201);

    await controller.list({ query: { active: true } }, res, next);
    expect(res.status).toHaveBeenCalledWith(200);

    await controller.getById({ params: { id: 'cat-1' } }, res, next);
    expect(res.status).toHaveBeenCalledWith(200);

    await controller.update({ params: { id: 'cat-1' }, body: { name: 'Hardware Novo' } }, res, next);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(next).not.toHaveBeenCalled();
  });

  it('maps ticket and comments controller requests', async () => {
    const res = response();
    const next = vi.fn();
    const controller = new TicketsController({
      createTicketUseCase: { execute: vi.fn().mockResolvedValue({ id: 't-1' }) },
      listTicketsUseCase: { execute: vi.fn().mockResolvedValue({ data: [], meta: {} }) },
      getTicketByIdUseCase: { execute: vi.fn().mockResolvedValue({ id: 't-1' }) },
      updateTicketUseCase: { execute: vi.fn().mockResolvedValue({ id: 't-1' }) },
      assignTicketUseCase: { execute: vi.fn().mockResolvedValue({ id: 't-1' }) },
      changeTicketStatusUseCase: { execute: vi.fn().mockResolvedValue({ id: 't-1' }) },
      createCommentUseCase: { execute: vi.fn().mockResolvedValue({ id: 'c-1' }) },
      listCommentsUseCase: { execute: vi.fn().mockResolvedValue([]) },
      listTicketEventsUseCase: { execute: vi.fn().mockResolvedValue([]) },
    });

    const user = { id: 'user-1', roles: ['USER'] };

    await controller.create({ user, body: { title: 'Ticket', description: 'Desc', categoryId: 'cat-1' } }, res, next);
    expect(res.status).toHaveBeenCalledWith(201);

    await controller.list({ user, query: {} }, res, next);
    expect(res.status).toHaveBeenCalledWith(200);

    await controller.getById({ user, params: { id: 't-1' } }, res, next);
    expect(res.status).toHaveBeenCalledWith(200);

    await controller.update({ user, params: { id: 't-1' }, body: { title: 'Novo' } }, res, next);
    expect(res.status).toHaveBeenCalledWith(200);

    await controller.assign({ user, params: { id: 't-1' }, body: { assignedUserId: 'agent-1' } }, res, next);
    expect(res.status).toHaveBeenCalledWith(200);

    await controller.changeStatus({ user, params: { id: 't-1' }, body: { status: 'IN_PROGRESS' } }, res, next);
    expect(res.status).toHaveBeenCalledWith(200);

    await controller.createComment({ user, params: { ticketId: 't-1' }, body: { content: 'Comentário' } }, res, next);
    expect(res.status).toHaveBeenCalledWith(201);

    await controller.listComments({ user, params: { ticketId: 't-1' } }, res, next);
    expect(res.status).toHaveBeenCalledWith(200);

    await controller.listEvents({ user, params: { ticketId: 't-1' } }, res, next);
    expect(res.status).toHaveBeenCalledWith(200);

    expect(next).not.toHaveBeenCalled();
  });

  it('forwards error to next when an exception is thrown in controllers', async () => {
    const res = response();
    const next = vi.fn();
    const error = new Error('Database error');

    const catController = new CategoriesController({
      createCategoryUseCase: { execute: vi.fn().mockRejectedValue(error) },
      listCategoriesUseCase: { execute: vi.fn().mockRejectedValue(error) },
      getCategoryByIdUseCase: { execute: vi.fn().mockRejectedValue(error) },
      updateCategoryUseCase: { execute: vi.fn().mockRejectedValue(error) },
    });

    await catController.create({ body: {} }, res, next);
    await catController.list({}, res, next);
    await catController.getById({ params: {} }, res, next);
    await catController.update({ params: {}, body: {} }, res, next);

    const ticketController = new TicketsController({
      createTicketUseCase: { execute: vi.fn().mockRejectedValue(error) },
      listTicketsUseCase: { execute: vi.fn().mockRejectedValue(error) },
      getTicketByIdUseCase: { execute: vi.fn().mockRejectedValue(error) },
      updateTicketUseCase: { execute: vi.fn().mockRejectedValue(error) },
      assignTicketUseCase: { execute: vi.fn().mockRejectedValue(error) },
      changeTicketStatusUseCase: { execute: vi.fn().mockRejectedValue(error) },
      createCommentUseCase: { execute: vi.fn().mockRejectedValue(error) },
      listCommentsUseCase: { execute: vi.fn().mockRejectedValue(error) },
      listTicketEventsUseCase: { execute: vi.fn().mockRejectedValue(error) },
    });

    const user = { id: 'u-1', roles: ['USER'] };
    await ticketController.create({ user, body: {} }, res, next);
    await ticketController.list({ user }, res, next);
    await ticketController.getById({ user, params: {} }, res, next);
    await ticketController.update({ user, params: {}, body: {} }, res, next);
    await ticketController.assign({ user, params: {}, body: {} }, res, next);
    await ticketController.changeStatus({ user, params: {}, body: {} }, res, next);
    await ticketController.createComment({ user, params: {}, body: {} }, res, next);
    await ticketController.listComments({ user, params: {} }, res, next);
    await ticketController.listEvents({ user, params: {} }, res, next);

    expect(next).toHaveBeenCalledTimes(13);
  });
});
