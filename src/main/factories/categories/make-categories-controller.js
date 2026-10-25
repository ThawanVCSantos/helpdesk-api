import { PrismaCategoriesRepository } from '../../../infrastructure/database/prisma/repositories/prisma-categories-repository.js';
import { CreateCategory } from '../../../application/use-cases/categories/create-category.js';
import { ListCategories } from '../../../application/use-cases/categories/list-categories.js';
import { GetCategoryById } from '../../../application/use-cases/categories/get-category-by-id.js';
import { UpdateCategory } from '../../../application/use-cases/categories/update-category.js';
import { CategoriesController } from '../../../presentation/http/controllers/categories-controller.js';

export const makeCategoriesController = () => {
  const categoriesRepository = new PrismaCategoriesRepository();

  const createCategoryUseCase = new CreateCategory({ categoriesRepository });
  const listCategoriesUseCase = new ListCategories({ categoriesRepository });
  const getCategoryByIdUseCase = new GetCategoryById({ categoriesRepository });
  const updateCategoryUseCase = new UpdateCategory({ categoriesRepository });

  return new CategoriesController({
    createCategoryUseCase,
    listCategoriesUseCase,
    getCategoryByIdUseCase,
    updateCategoryUseCase,
  });
};
