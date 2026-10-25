import { z } from 'zod';

export const getCategoryByIdSchema = z.object({
  params: z.object({
    id: z.string().uuid('ID de categoria inválido'),
  }),
});
