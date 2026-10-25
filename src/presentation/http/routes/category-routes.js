import { Router } from 'express';
import { makeCategoriesController } from '../../../main/factories/categories/make-categories-controller.js';
import { validateSchema } from '../middlewares/validate-schema.js';
import { ensureAuthenticated } from '../middlewares/ensure-authenticated.js';
import { ensureHasRole } from '../middlewares/ensure-has-role.js';
import { createCategorySchema } from '../validators/categories/create-category-schema.js';
import { updateCategorySchema } from '../validators/categories/update-category-schema.js';
import { getCategoryByIdSchema } from '../validators/categories/get-category-by-id-schema.js';
import { listCategoriesSchema } from '../validators/categories/list-categories-schema.js';

export const categoriesRouter = Router();
const categoriesController = makeCategoriesController();

categoriesRouter.use(ensureAuthenticated());

// Listagem e detalhes permitidos para qualquer usuário autenticado (para escolher categoria ao abrir chamado)
categoriesRouter.get('/', validateSchema(listCategoriesSchema), categoriesController.list);
categoriesRouter.get('/:id', validateSchema(getCategoryByIdSchema), categoriesController.getById);

categoriesRouter.post('/', ensureHasRole('ADMIN'), validateSchema(createCategorySchema), categoriesController.create);
categoriesRouter.put('/:id', ensureHasRole('ADMIN'), validateSchema(updateCategorySchema), categoriesController.update);
