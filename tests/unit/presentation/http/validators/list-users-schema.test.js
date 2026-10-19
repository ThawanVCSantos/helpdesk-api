import { describe, expect, it } from 'vitest';
import { listUsersSchema } from '../../../../../src/presentation/http/validators/users/list-users-schema.js';

describe('listUsersSchema', () => {
  it('leaves active undefined when the filter is not provided', () => {
    const result = listUsersSchema.parse({ query: {} });

    expect(result.query).toMatchObject({ page: 1, limit: 20 });
    expect(result.query).not.toHaveProperty('active');
  });

  it.each([
    ['true', true],
    ['false', false],
  ])('converts active=%s to a boolean', (value, expected) => {
    expect(listUsersSchema.parse({ query: { active: value } }).query.active).toBe(expected);
  });
});
