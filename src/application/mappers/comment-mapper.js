import { Comment } from '../../domain/entities/comment.js';
import { UserMapper } from './user-mapper.js';
import { AttachmentMapper } from './attachment-mapper.js';

export class CommentMapper {
  static toDomain(raw) {
    if (!raw) return null;

    return new Comment({
      id: raw.id,
      ticketId: raw.ticketId,
      userId: raw.userId,
      content: raw.content,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      user: raw.user ? UserMapper.toDomain(raw.user) : null,
      attachments: Array.isArray(raw.attachments)
        ? raw.attachments.map((item) => AttachmentMapper.toDomain(item.attachment || item))
        : [],
    });
  }

  static toDTO(comment, options = {}) {
    if (!comment) return null;

    return {
      id: comment.id,
      ticketId: comment.ticketId,
      userId: comment.userId,
      content: comment.content,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      user: comment.user ? UserMapper.toDTO(comment.user) : null,
      attachments: (comment.attachments || []).map((attachment) =>
        AttachmentMapper.toDTO(attachment, options)
      ),
    };
  }

  static toDTOList(comments, options = {}) {
    if (!Array.isArray(comments)) return [];
    return comments.map((c) => this.toDTO(c, options));
  }
}
