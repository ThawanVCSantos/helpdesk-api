import { Category } from '../../domain/entities/category.js';

export class CategoryMapper {
  static toDomain(raw) {
    if (!raw) return null;

    return new Category({
      id: raw.id,
      name: raw.name,
      description: raw.description,
      active: raw.active,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }

  static toDTO(category) {
    if (!category) return null;

    return {
      id: category.id,
      name: category.name,
      description: category.description,
      active: category.active,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    };
  }

  static toDTOList(categories) {
    if (!Array.isArray(categories)) return [];
    return categories.map((c) => this.toDTO(c));
  }
}
