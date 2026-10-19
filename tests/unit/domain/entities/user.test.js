import { describe, expect, it } from 'vitest';
import { User } from '../../../../src/domain/entities/user.js';

describe('User', () => {
  it('creates a user with domain defaults', () => {
    const user = new User({
      id: 'user-id',
      name: 'Maria',
      email: 'maria@example.com',
    });

    expect(user).toMatchObject({
      id: 'user-id',
      name: 'Maria',
      email: 'maria@example.com',
      password: null,
      active: false,
      roles: [],
    });
    expect(user.createdAt).toBeInstanceOf(Date);
    expect(user.updatedAt).toBeInstanceOf(Date);
  });
});
