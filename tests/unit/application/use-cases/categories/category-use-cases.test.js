import { describe, expect, it, vi } from 'vitest';
import { CreateCategory } from '../../../../../src/application/use-cases/categories/create-category.js';
import { ListCategories } from '../../../../../src/application/use-cases/categories/list-categories.js';
import { GetCategoryById } from '../../../../../src/application/use-cases/categories/get-category-by-id.js';
import { UpdateCategory } from '../../../../../src/application/use-cases/categories/update-category.js';
import { ConflictError } from '../../../../../src/domain/errors/conflict-error.js';
import { NotFoundError } from '../../../../../src/domain/errors/not-found-error.js';
import { Category } from '../../../../../src/domain/entities/category.js';

describe('Categories Use Cases', () => {
  it('creates category successfully', async () => {
    const categoriesRepository = {
      findByName: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockImplementation(async (data) => new Category({ id: 'cat-1', ...data })),
    };
    const useCase = new CreateCategory({ categoriesRepository });

    const result = await useCase.execute({ name: 'Hardware', description: 'Problemas de hardware' });

    expect(result.id).toBe('cat-1');
    expect(result.name).toBe('Hardware');
    expect(categoriesRepository.create).toHaveBeenCalled();
  });

  it('throws conflict if category name already exists on create', async () => {
    const categoriesRepository = {
      findByName: vi.fn().mockResolvedValue(new Category({ id: 'cat-1', name: 'Hardware' })),
    };
    const useCase = new CreateCategory({ categoriesRepository });

    await expect(useCase.execute({ name: 'Hardware' })).rejects.toThrow(ConflictError);
  });

  it('lists categories with filters', async () => {
    const categoriesRepository = {
      findAll: vi.fn().mockResolvedValue([
        new Category({ id: '1', name: 'Software', active: true }),
      ]),
    };
    const useCase = new ListCategories({ categoriesRepository });

    const result = await useCase.execute({ active: true });
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Software');
  });

  it('gets category by id or throws not found', async () => {
    const categoriesRepository = {
      findById: vi.fn().mockResolvedValueOnce(new Category({ id: 'cat-1', name: 'Redes' }))
        .mockResolvedValueOnce(null),
    };
    const useCase = new GetCategoryById({ categoriesRepository });

    const result = await useCase.execute({ id: 'cat-1' });
    expect(result.name).toBe('Redes');

    await expect(useCase.execute({ id: 'invalid' })).rejects.toThrow(NotFoundError);
  });

  it('updates category successfully', async () => {
    const existing = new Category({ id: 'cat-1', name: 'Hardware Antigo' });
    const categoriesRepository = {
      findById: vi.fn().mockResolvedValue(existing),
      findByName: vi.fn().mockResolvedValue(null),
      update: vi.fn().mockImplementation(async (id, data) => new Category({ ...existing, ...data })),
    };
    const useCase = new UpdateCategory({ categoriesRepository });

    const result = await useCase.execute({ id: 'cat-1', name: 'Hardware Novo' });
    expect(result.name).toBe('Hardware Novo');

    // Throws NotFoundError if category does not exist
    categoriesRepository.findById.mockResolvedValueOnce(null);
    await expect(useCase.execute({ id: 'invalid', name: 'Software' })).rejects.toThrow(NotFoundError);

    // Throws ConflictError if duplicate name exists
    categoriesRepository.findById.mockResolvedValueOnce(existing);
    categoriesRepository.findByName.mockResolvedValueOnce(new Category({ id: 'cat-2', name: 'Hardware Novo' }));
    await expect(useCase.execute({ id: 'cat-1', name: 'Hardware Novo' })).rejects.toThrow(ConflictError);
  });
});
