import { describe, expect, it } from 'vitest';
import { passwordSchema } from '../../../../../src/presentation/http/validators/shared/password-schema.js';

describe('passwordSchema', () => {
  it('accepts passwords with upper case, lower case, number and symbol', () => {
    expect(passwordSchema.safeParse('Password123!').success).toBe(true);
  });

  it.each([
    ['sem letra minúscula', 'PASSWORD123!'],
    ['sem letra maiúscula', 'password123!'],
    ['sem número', 'Password!'],
    ['sem caractere especial', 'Password123'],
  ])('rejects passwords %s', (_, password) => {
    expect(passwordSchema.safeParse(password).success).toBe(false);
  });
});
