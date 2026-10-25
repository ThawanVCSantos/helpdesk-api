import { db } from '../prisma-client.js';
import { CategoryMapper } from '../../../../application/mappers/category-mapper.js';

export class PrismaCategoriesRepository {
  constructor(prisma = db) {
    this.prisma = prisma;
  }

  async findById(id) {
    const raw = await this.prisma.category.findUnique({
      where: { id },
    });
    return CategoryMapper.toDomain(raw);
  }

  async findByName(name) {
    const raw = await this.prisma.category.findUnique({
      where: { name: name.trim() },
    });
    return CategoryMapper.toDomain(raw);
  }

  async findAll({ active, search } = {}) {
    const where = {};

    if (typeof active === 'boolean') {
      where.active = active;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const rows = await this.prisma.category.findMany({
      where,
      orderBy: { name: 'asc' },
    });

    return rows.map((row) => CategoryMapper.toDomain(row));
  }

  async create({ name, description = null, active = true }) {
    const raw = await this.prisma.category.create({
      data: {
        name: name.trim(),
        description: description ? description.trim() : null,
        active,
      },
    });
    return CategoryMapper.toDomain(raw);
  }

  async update(id, { name, description, active }) {
    const data = {};
    if (name !== undefined) data.name = name.trim();
    if (description !== undefined) data.description = description ? description.trim() : null;
    if (active !== undefined) data.active = active;

    const raw = await this.prisma.category.update({
      where: { id },
      data,
    });
    return CategoryMapper.toDomain(raw);
  }
}
