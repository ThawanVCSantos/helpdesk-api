import { z } from 'zod';

export const listUsersSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
    active: z.enum(['true', 'false']).optional().transform((value) => (
      value === undefined ? undefined : value === 'true'
    )),
    search: z.string().optional(),
  }),
});
