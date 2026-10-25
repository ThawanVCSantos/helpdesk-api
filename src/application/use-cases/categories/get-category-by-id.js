import { NotFoundError } from '../../../domain/errors/not-found-error.js';
import { CategoryMapper } from '../../mappers/category-mapper.js';

export class GetCategoryById {
  constructor({ categoriesRepository }) {
    this.categoriesRepository = categoriesRepository;
  }

  async execute({ id }) {
    const category = await this.categoriesRepository.findById(id);
    if (!category) {
      throw new NotFoundError('Categoria não encontrada');
    }
    return CategoryMapper.toDTO(category);
  }
}
