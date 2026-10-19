import { z } from 'zod';

export const getUserByIdSchema = z.object({
  params: z.object({
    id: z.string().uuid('ID de usuário inválido'),
  }),
});
