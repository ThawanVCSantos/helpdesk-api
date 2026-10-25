import { Comment } from '../../domain/entities/comment.js';
import { UserMapper } from './user-mapper.js';

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
    });
  }

  static toDTO(comment) {
    if (!comment) return null;

    return {
      id: comment.id,
      ticketId: comment.ticketId,
      userId: comment.userId,
      content: comment.content,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      user: comment.user ? UserMapper.toDTO(comment.user) : null,
    };
  }

  static toDTOList(comments) {
    if (!Array.isArray(comments)) return [];
    return comments.map((c) => this.toDTO(c));
  }
}
