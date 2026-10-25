export class CategoriesController {
  constructor({
    createCategoryUseCase,
    listCategoriesUseCase,
    getCategoryByIdUseCase,
    updateCategoryUseCase,
  }) {
    this.createCategoryUseCase = createCategoryUseCase;
    this.listCategoriesUseCase = listCategoriesUseCase;
    this.getCategoryByIdUseCase = getCategoryByIdUseCase;
    this.updateCategoryUseCase = updateCategoryUseCase;
  }

  create = async (req, res, next) => {
    try {
      const { name, description, active } = req.body;
      const category = await this.createCategoryUseCase.execute({ name, description, active });
      return res.status(201).json(category);
    } catch (error) {
      return next(error);
    }
  };

  list = async (req, res, next) => {
    try {
      const query = req.validated?.query || req.query || {};
      const { active, search } = query;
      const categories = await this.listCategoriesUseCase.execute({ active, search });
      return res.status(200).json(categories);
    } catch (error) {
      return next(error);
    }
  };

  getById = async (req, res, next) => {
    try {
      const { id } = req.params;
      const category = await this.getCategoryByIdUseCase.execute({ id });
      return res.status(200).json(category);
    } catch (error) {
      return next(error);
    }
  };

  update = async (req, res, next) => {
    try {
      const { id } = req.params;
      const { name, description, active } = req.body;
      const category = await this.updateCategoryUseCase.execute({ id, name, description, active });
      return res.status(200).json(category);
    } catch (error) {
      return next(error);
    }
  };
}
