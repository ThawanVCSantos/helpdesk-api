import { z } from 'zod';

export const listNotificationsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
    unreadOnly: z
      .enum(['true', 'false'])
      .optional()
      .transform((val) => val === 'true'),
    channel: z.enum(['IN_APP', 'EMAIL']).default('IN_APP'),
  }),
});

export const getNotificationByIdSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

export const markAllNotificationsAsReadSchema = z.object({
  body: z.object({
    channel: z.enum(['IN_APP', 'EMAIL']).default('IN_APP'),
  }).default({}),
});
