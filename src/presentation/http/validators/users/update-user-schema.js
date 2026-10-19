import { z } from 'zod';

export const updateUserSchema = z.object({
  params: z.object({
    id: z.string().uuid('ID de usuário inválido'),
  }),
  body: z.object({
    name: z.string().trim().min(2).max(100).optional(),
    email: z.string().trim().email('E-mail inválido').max(254).optional(),
    roles: z.array(z.enum(['USER', 'AGENT', 'ADMIN'])).min(1).optional(),
  }),
});
