import { describe, expect, it } from 'vitest';
import { listCategoriesSchema } from '../../../../../src/presentation/http/validators/categories/list-categories-schema.js';
import { updateCategorySchema } from '../../../../../src/presentation/http/validators/categories/update-category-schema.js';
import { updateTicketSchema } from '../../../../../src/presentation/http/validators/tickets/update-ticket-schema.js';

describe('Categories and Tickets schema validators', () => {
  it('parses listCategoriesSchema correctly', () => {
    expect(listCategoriesSchema.parse({ query: {} }).query.active).toBeUndefined();
    expect(listCategoriesSchema.parse({ query: { active: 'true' } }).query.active).toBe(true);
    expect(listCategoriesSchema.parse({ query: { active: 'false' } }).query.active).toBe(false);
  });

  it('validates updateCategorySchema refinement', () => {
    const valid = { params: { id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' }, body: { name: 'New Name' } };
    expect(updateCategorySchema.parse(valid)).toMatchObject(valid);

    const emptyBody = { params: { id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' }, body: {} };
    expect(() => updateCategorySchema.parse(emptyBody)).toThrow();
  });

  it('validates updateTicketSchema refinement', () => {
    const valid = { params: { id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' }, body: { title: 'Updated' } };
    expect(updateTicketSchema.parse(valid)).toMatchObject(valid);

    const emptyBody = { params: { id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' }, body: {} };
    expect(() => updateTicketSchema.parse(emptyBody)).toThrow();
  });

  it('validates changeTicketStatusSchema rejects invalid status', async () => {
    const { changeTicketStatusSchema } = await import(
      '../../../../../src/presentation/http/validators/tickets/change-ticket-status-schema.js'
    );
    expect(() =>
      changeTicketStatusSchema.parse({
        params: { id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' },
        body: { status: 'INVALID_STATUS' },
      })
    ).toThrow();
  });
});
