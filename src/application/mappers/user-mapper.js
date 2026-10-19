import { User } from '../../domain/entities/user.js';

export class UserMapper {
  static toDomain(raw) {
    if (!raw) return null;

    const roles = Array.isArray(raw.roles)
      ? raw.roles.map((r) => (r.role ? r.role.name : r.name || r))
      : [];

    return new User({
      id: raw.id,
      name: raw.name,
      email: raw.email,
      password: raw.password,
      active: raw.active,
      roles,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }

  static toDTO(user) {
    if (!user) return null;

    const roles = Array.isArray(user.roles)
      ? user.roles.map((r) => (typeof r === 'string' ? r : r.role ? r.role.name : r.name))
      : [];

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      active: user.active,
      roles,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  static toDTOList(users) {
    if (!Array.isArray(users)) return [];
    return users.map((user) => this.toDTO(user));
  }
}
