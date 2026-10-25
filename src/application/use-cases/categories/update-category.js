import { ConflictError } from '../../../domain/errors/conflict-error.js';
import { NotFoundError } from '../../../domain/errors/not-found-error.js';
import { CategoryMapper } from '../../mappers/category-mapper.js';

export class UpdateCategory {
  constructor({ categoriesRepository }) {
    this.categoriesRepository = categoriesRepository;
  }

  async execute({ id, name, description, active }) {
    const existing = await this.categoriesRepository.findById(id);
    if (!existing) {
      throw new NotFoundError('Categoria não encontrada');
    }

    if (name && name.trim().toLowerCase() !== existing.name.toLowerCase()) {
      const duplicate = await this.categoriesRepository.findByName(name);
      if (duplicate && duplicate.id !== id) {
        throw new ConflictError('Já existe uma categoria cadastrada com este nome');
      }
    }

    const updated = await this.categoriesRepository.update(id, {
      name,
      description,
      active,
    });

    return CategoryMapper.toDTO(updated);
  }
}
