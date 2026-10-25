import { z } from 'zod';

export const createCategorySchema = z.object({
  body: z.object({
    name: z.string().trim().min(2, 'Nome da categoria deve ter no mínimo 2 caracteres').max(100),
    description: z.string().trim().max(1000).nullable().optional(),
    active: z.boolean().optional().default(true),
  }),
});
