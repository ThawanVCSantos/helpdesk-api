import { z } from 'zod';

export const updateTicketSchema = z.object({
  params: z.object({
    id: z.string().uuid('ID de chamado inválido'),
  }),
  body: z.object({
    title: z.string().trim().min(3).max(200).optional(),
    description: z.string().trim().min(5).optional(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
    categoryId: z.string().uuid().optional(),
    dueDate: z.string().datetime({ offset: true }).nullable().optional(),
  }).refine(
    (data) =>
      data.title !== undefined ||
      data.description !== undefined ||
      data.priority !== undefined ||
      data.categoryId !== undefined ||
      data.dueDate !== undefined,
    { message: 'Pelo menos um campo deve ser informado para atualização' }
  ),
});
