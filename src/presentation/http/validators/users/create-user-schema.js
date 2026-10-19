import { z } from 'zod';

export const createUserSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2, 'Nome deve ter no mínimo 2 caracteres').max(100),
    email: z.string().trim().email('E-mail inválido').max(254),
    roles: z.array(z.enum(['USER', 'AGENT', 'ADMIN'])).min(1, 'Informe pelo menos um perfil de acesso').default(['USER']),
  }),
});
