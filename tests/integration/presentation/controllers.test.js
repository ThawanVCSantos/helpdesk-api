import { describe, expect, it, vi } from 'vitest';
import { AuthController } from '../../../src/presentation/http/controllers/auth-controller.js';
import { UsersController } from '../../../src/presentation/http/controllers/users-controller.js';

const response = () => ({
  status: vi.fn().mockReturnThis(),
  json: vi.fn().mockReturnThis(),
  send: vi.fn().mockReturnThis(),
});

describe('HTTP controllers', () => {
  it('maps authentication requests to use cases', async () => {
    const res = response();
    const next = vi.fn();
    const controller = new AuthController({
      authenticateUserUseCase: { execute: vi.fn().mockResolvedValue({ token: 'jwt' }) },
      forgotPasswordUseCase: { execute: vi.fn().mockResolvedValue({ message: 'ok' }) },
      resetPasswordUseCase: { execute: vi.fn().mockResolvedValue({ message: 'reset' }) },
      getUserProfileUseCase: { execute: vi.fn().mockResolvedValue({ id: 'user-id' }) },
    });

    await controller.login({ body: { email: 'a@b.com', password: 'secret' } }, res, next);
    await controller.forgotPassword({ body: { email: 'a@b.com' } }, res, next);
    await controller.resetPassword({ body: { token: 'token', password: 'secret' } }, res, next);
    await controller.me({ user: { id: 'user-id' } }, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('maps user requests and returns no content for status changes', async () => {
    const res = response();
    const next = vi.fn();
    const controller = new UsersController({
      createUserUseCase: { execute: vi.fn().mockResolvedValue({ id: 'user-id' }) },
      listUsersUseCase: { execute: vi.fn().mockResolvedValue({ data: [], meta: {} }) },
      getUserProfileUseCase: { execute: vi.fn().mockResolvedValue({ id: 'user-id' }) },
      updateUserUseCase: { execute: vi.fn().mockResolvedValue({ id: 'user-id' }) },
      setUserActiveUseCase: { execute: vi.fn().mockResolvedValue(undefined) },
    });

    await controller.create({ body: { name: 'Maria', email: 'maria@example.com' } }, res, next);
    await controller.list({ query: {} }, res, next);
    await controller.getById({ params: { id: 'user-id' } }, res, next);
    await controller.update({ params: { id: 'user-id' }, body: {} }, res, next);
    await controller.setActive({ params: { id: 'user-id' }, body: { active: false } }, res, next);

    expect(res.status).toHaveBeenCalledWith(204);
    expect(next).not.toHaveBeenCalled();
  });
});
