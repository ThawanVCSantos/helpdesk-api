import { z } from 'zod';

export const getTicketByIdSchema = z.object({
  params: z.object({
    id: z.string().uuid('ID de chamado inválido'),
  }),
});
