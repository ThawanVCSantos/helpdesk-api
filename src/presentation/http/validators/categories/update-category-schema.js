import { z } from 'zod';

export const updateCategorySchema = z.object({
  params: z.object({
    id: z.string().uuid('ID de categoria inválido'),
  }),
  body: z.object({
    name: z.string().trim().min(2, 'Nome da categoria deve ter no mínimo 2 caracteres').max(100).optional(),
    description: z.string().trim().max(1000).nullable().optional(),
    active: z.boolean().optional(),
  }).refine((data) => data.name !== undefined || data.description !== undefined || data.active !== undefined, {
    message: 'Pelo menos um campo deve ser informado para atualização',
  }),
});
