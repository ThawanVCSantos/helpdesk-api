import { z } from 'zod';

export const listCategoriesSchema = z.object({
  query: z.object({
    active: z
      .enum(['true', 'false'])
      .optional()
      .transform((val) => (val === undefined ? undefined : val === 'true')),
    search: z.string().trim().optional(),
  }),
});
