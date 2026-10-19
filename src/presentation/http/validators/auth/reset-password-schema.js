import { z } from 'zod';
import { passwordSchema } from '../shared/password-schema.js';

export const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(1, 'Token de recuperação é obrigatório'),
    password: passwordSchema,
  }),
});
