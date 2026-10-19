import { z } from 'zod';

export const toggleUserActiveSchema = z.object({
  params: z.object({
    id: z.string().uuid('ID de usuário inválido'),
  }),
  body: z.object({
    active: z.boolean({ required_error: 'Campo active é obrigatório' }),
  }),
});
