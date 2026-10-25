import { z } from 'zod';

export const assignTicketSchema = z.object({
  params: z.object({
    id: z.string().uuid('ID de chamado inválido'),
  }),
  body: z.object({
    assignedUserId: z.string().uuid('ID de usuário responsável inválido').nullable(),
  }),
});
