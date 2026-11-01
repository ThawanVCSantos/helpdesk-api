import { z } from 'zod';

export const ticketAttachmentParamsSchema = z.object({
  params: z.object({
    ticketId: z.string().uuid(),
  }),
});

export const commentAttachmentParamsSchema = z.object({
  params: z.object({
    commentId: z.string().uuid(),
  }),
});

export const deleteAttachmentParamsSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});
