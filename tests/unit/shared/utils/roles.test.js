import { describe, expect, it } from 'vitest';
import {
  ROLES,
  hasRole,
  hasAnyRole,
  canHandleTickets,
  isUserOnly,
} from '../../../../src/shared/utils/roles.js';

describe('Roles helper (shared/utils/roles.js)', () => {
  it('should export ROLES constants', () => {
    expect(ROLES).toEqual({
      ADMIN: 'ADMIN',
      AGENT: 'AGENT',
      USER: 'USER',
    });
  });
  it('should verify hasRole correctly', () => {
    expect(hasRole(['USER', 'AGENT'], 'AGENT')).toBe(true);
    expect(hasRole(['USER'], 'ADMIN')).toBe(false);
    expect(hasRole(null, 'USER')).toBe(false);
    expect(hasRole(undefined, 'USER')).toBe(false);
  });

  it('should verify hasAnyRole correctly', () => {
    expect(hasAnyRole(['USER', 'AGENT'], ['ADMIN', 'AGENT'])).toBe(true);
    expect(hasAnyRole(['USER'], ['ADMIN', 'AGENT'])).toBe(false);
    expect(hasAnyRole(undefined, ['ADMIN'])).toBe(false);
  });

  it('should verify canHandleTickets correctly', () => {
    expect(canHandleTickets(['AGENT'])).toBe(true);
    expect(canHandleTickets(['ADMIN'])).toBe(true);
    expect(canHandleTickets(['USER', 'AGENT'])).toBe(true);
    expect(canHandleTickets(['USER'])).toBe(false);
    expect(canHandleTickets([])).toBe(false);
  });

  it('should verify isUserOnly correctly', () => {
    expect(isUserOnly(['USER'])).toBe(true);
    expect(isUserOnly(['USER', 'AGENT'])).toBe(false);
    expect(isUserOnly(['USER', 'ADMIN'])).toBe(false);
    expect(isUserOnly(['AGENT'])).toBe(false);
    expect(isUserOnly([])).toBe(false);
  });
});
