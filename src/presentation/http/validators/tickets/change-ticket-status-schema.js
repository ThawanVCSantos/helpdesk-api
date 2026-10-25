import { z } from 'zod';

export const changeTicketStatusSchema = z.object({
  params: z.object({
    id: z.string().uuid('ID de chamado inválido'),
  }),
  body: z.object({
    status: z.enum(['OPEN', 'IN_PROGRESS', 'WAITING_USER', 'RESOLVED', 'CLOSED']),
  }),
});
