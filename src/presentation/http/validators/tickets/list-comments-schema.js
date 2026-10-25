import { z } from 'zod';

export const listCommentsSchema = z.object({
  params: z.object({
    ticketId: z.string().uuid('ID de chamado inválido'),
  }),
});
