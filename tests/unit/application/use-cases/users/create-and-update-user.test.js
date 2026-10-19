import { describe, it, expect, vi } from 'vitest';
import { CreateUser } from '../../../../../src/application/use-cases/users/create-user.js';
import { ConflictError } from '../../../../../src/domain/errors/conflict-error.js';
import { NotFoundError } from '../../../../../src/domain/errors/not-found-error.js';
import { UpdateUser } from '../../../../../src/application/use-cases/users/update-user.js';

describe('Users Use Cases (Unit)', () => {
  it('should throw ConflictError if email is already registered', async () => {
    const mockUsersRepo = {
      findByEmail: vi.fn().mockResolvedValue({ id: 'existing-id', email: 'taken@test.com' }),
    };

    const useCase = new CreateUser({ usersRepository: mockUsersRepo });

    await expect(
      useCase.execute({ name: 'Bob', email: 'taken@test.com' })
    ).rejects.toThrow(ConflictError);
  });

  it('should throw NotFoundError if requested role does not exist', async () => {
    const mockUsersRepo = {
      findByEmail: vi.fn().mockResolvedValue(null),
    };
    const mockRolesRepo = { findByNames: vi.fn().mockResolvedValue([]) };

    const useCase = new CreateUser({
      usersRepository: mockUsersRepo,
      rolesRepository: mockRolesRepo,
    });

    await expect(
      useCase.execute({ name: 'Bob', email: 'bob@test.com', roles: ['NON_EXISTENT_ROLE'] })
    ).rejects.toThrow(NotFoundError);
  });

  it('should create user without password and dispatch welcome/setup email', async () => {
    const mockUsersRepo = {
      findByEmail: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockResolvedValue({
        id: 'new-user-id',
        name: 'Bob',
        email: 'bob@test.com',
        active: true,
        roles: [{ role: { name: 'USER' } }],
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    };
    const mockRolesRepo = {
      findByNames: vi.fn().mockResolvedValue([{ id: 'role-id', name: 'USER' }]),
    };
    const mockUserTokensRepo = {
      create: vi.fn().mockResolvedValue({ id: 'token-id' }),
    };
    const mockHashService = {
      randomToken: vi.fn().mockReturnValue('setup-token'),
      hash: vi.fn().mockReturnValue('hashed-setup-token'),
    };
    const mockMailService = {
      sendMail: vi.fn().mockResolvedValue(true),
    };

    const useCase = new CreateUser({
      usersRepository: mockUsersRepo,
      rolesRepository: mockRolesRepo,
      userTokensRepository: mockUserTokensRepo,
      hashService: mockHashService,
      mailService: mockMailService,
    });

    const result = await useCase.execute({
      name: 'Bob',
      email: 'bob@test.com',
      roles: ['USER'],
    });

    expect(result.id).toBe('new-user-id');
    expect(result.email).toBe('bob@test.com');
    expect(mockUserTokensRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'new-user-id',
        token: 'hashed-setup-token',
        type: 'PASSWORD_SETUP',
      })
    );
    expect(mockMailService.sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'bob@test.com',
        template: 'welcome-user',
        variables: expect.objectContaining({
          token: 'setup-token',
        }),
      })
    );
  });

  it('should update and normalize the email', async () => {
    const usersRepository = {
      findById: vi.fn().mockResolvedValue({
        id: 'user-id',
        email: 'old@test.com',
      }),
      findByEmail: vi.fn().mockResolvedValue(null),
      update: vi.fn().mockResolvedValue({
        id: 'user-id',
        email: 'new@test.com',
      }),
    };
    const rolesRepository = { findByNames: vi.fn().mockResolvedValue([]) };
    const updateUser = new UpdateUser({ usersRepository, rolesRepository });

    const result = await updateUser.execute({
      id: 'user-id',
      email: 'NEW@test.com',
    });

    expect(result.email).toBe('new@test.com');
    expect(usersRepository.update).toHaveBeenCalledWith('user-id', {
      name: undefined,
      email: 'new@test.com',
      roleNames: undefined,
    });
  });
});
