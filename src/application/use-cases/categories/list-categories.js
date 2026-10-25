import { CategoryMapper } from '../../mappers/category-mapper.js';

export class ListCategories {
  constructor({ categoriesRepository }) {
    this.categoriesRepository = categoriesRepository;
  }

  async execute({ active, search } = {}) {
    const categories = await this.categoriesRepository.findAll({ active, search });
    return CategoryMapper.toDTOList(categories);
  }
}
