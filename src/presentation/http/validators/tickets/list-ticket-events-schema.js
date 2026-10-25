import { z } from 'zod';

export const listTicketEventsSchema = z.object({
  params: z.object({
    ticketId: z.string().uuid('ID de chamado inválido'),
  }),
});
