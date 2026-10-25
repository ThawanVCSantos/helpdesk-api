import { z } from 'zod';

export const listTicketsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(10),
    status: z.enum(['OPEN', 'IN_PROGRESS', 'WAITING_USER', 'RESOLVED', 'CLOSED']).optional(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
    categoryId: z.string().uuid().optional(),
    requesterId: z.string().uuid().optional(),
    assignedUserId: z.string().uuid().optional(),
    search: z.string().trim().optional(),
  }),
});
