import { z } from 'zod';

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().trim().email('E-mail inválido'),
  }),
});
