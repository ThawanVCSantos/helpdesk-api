import { z } from 'zod';

export const createTicketSchema = z.object({
  body: z.object({
    title: z.string().trim().min(3, 'Título deve ter no mínimo 3 caracteres').max(200),
    description: z.string().trim().min(5, 'Descrição deve ter no mínimo 5 caracteres'),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional().default('MEDIUM'),
    categoryId: z.string().uuid('ID de categoria inválido'),
    dueDate: z.string().datetime({ offset: true }).nullable().optional(),
  }),
});
