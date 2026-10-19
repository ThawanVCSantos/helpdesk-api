import { describe, expect, it, vi } from 'vitest';
import { ensureAuthenticated } from '../../../../../src/presentation/http/middlewares/ensure-authenticated.js';
import { ensureHasRole } from '../../../../../src/presentation/http/middlewares/ensure-has-role.js';

describe('authentication and authorization middleware', () => {
  it('authenticates bearer requests and checks roles', () => {
    const next = vi.fn();
    const req = { headers: { authorization: 'Bearer token' } };
    const tokenService = {
      verifyToken: vi.fn().mockReturnValue({
        sub: 'id',
        email: 'a@b.com',
        roles: ['ADMIN'],
      }),
    };

    ensureAuthenticated(tokenService)(req, {}, next);
    ensureHasRole('ADMIN')(req, {}, next);

    expect(req.user.id).toBe('id');
    expect(next).toHaveBeenCalled();
  });
});
