import { ConflictError } from '../../../domain/errors/conflict-error.js';
import { CategoryMapper } from '../../mappers/category-mapper.js';

export class CreateCategory {
  constructor({ categoriesRepository }) {
    this.categoriesRepository = categoriesRepository;
  }

  async execute({ name, description = null, active = true }) {
    const existing = await this.categoriesRepository.findByName(name);
    if (existing) {
      throw new ConflictError('Já existe uma categoria cadastrada com este nome');
    }

    const created = await this.categoriesRepository.create({
      name,
      description,
      active,
    });

    return CategoryMapper.toDTO(created);
  }
}
