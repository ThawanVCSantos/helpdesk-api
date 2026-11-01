import { z } from 'zod';

export const getCommentByIdSchema = z.object({
  params: z.object({
    id: z.string().uuid('ID de comentário inválido'),
  }),
});
