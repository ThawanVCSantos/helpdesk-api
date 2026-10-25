import { z } from 'zod';

export const createCommentSchema = z.object({
  params: z.object({
    ticketId: z.string().uuid('ID de chamado inválido'),
  }),
  body: z.object({
    content: z.string().trim().min(1, 'Comentário não pode estar vazio').max(2000),
  }),
});
