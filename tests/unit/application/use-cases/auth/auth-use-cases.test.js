import { describe, it, expect, vi } from 'vitest';
import { AuthenticateUser } from '../../../../../src/application/use-cases/auth/authenticate-user.js';
import { ForgotPassword } from '../../../../../src/application/use-cases/auth/forgot-password.js';
import { ResetPassword } from '../../../../../src/application/use-cases/auth/reset-password.js';
import { UnauthorizedError } from '../../../../../src/domain/errors/unauthorized-error.js';
import { AppError } from '../../../../../src/domain/errors/app-error.js';
import { UserToken } from '../../../../../src/domain/entities/user-token.js';

describe('Auth Use Cases (Unit)', () => {
  describe('AuthenticateUser', () => {
    it('should throw UnauthorizedError when user is not found', async () => {
      const mockUsersRepo = {
        findByEmail: vi.fn().mockResolvedValue(null),
      };

      const useCase = new AuthenticateUser({ usersRepository: mockUsersRepo });

      await expect(
        useCase.execute({ email: 'nonexistent@test.com', password: 'Password123!' })
      ).rejects.toThrow(UnauthorizedError);
    });

    it('should reject inactive users with generic credential error', async () => {
      const mockUsersRepo = {
        findByEmail: vi.fn().mockResolvedValue({
          id: 'user-id',
          email: 'inactive@test.com',
          active: false,
          password: 'hashed-password',
        }),
      };

      const useCase = new AuthenticateUser({ usersRepository: mockUsersRepo });

      await expect(
        useCase.execute({ email: 'inactive@test.com', password: 'Password123!' })
      ).rejects.toThrow('Credenciais inválidas');
    });

    it('should return only an access token on valid credentials', async () => {
      const mockUsersRepo = {
        findByEmail: vi.fn().mockResolvedValue({
          id: '11111111-1111-1111-1111-111111111111',
          name: 'John Doe',
          email: 'john@test.com',
          active: true,
          password: 'hashed-password',
          roles: [{ role: { name: 'USER' } }],
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      };

      const mockHasher = {
        verify: vi.fn().mockResolvedValue(true),
      };

      const mockTokenService = {
        generateToken: vi.fn().mockReturnValue('mocked-jwt-token'),
      };

      const useCase = new AuthenticateUser({
        usersRepository: mockUsersRepo,
        passwordHasher: mockHasher,
        tokenService: mockTokenService,
      });

      const result = await useCase.execute({
        email: 'john@test.com',
        password: 'Password123!',
      });

      expect(result.token).toBe('mocked-jwt-token');
      expect(result).toEqual({ token: 'mocked-jwt-token' });
    });
  });

  describe('ForgotPassword', () => {
    it('should generate token, hash with sha256 and dispatch email for existing user', async () => {
      const mockUsersRepo = {
        findByEmail: vi.fn().mockResolvedValue({
          id: 'user-id',
          name: 'Jane Doe',
          email: 'jane@test.com',
        }),
      };

      const mockUserTokensRepo = {
        revokeAllByUserId: vi.fn().mockResolvedValue({ count: 1 }),
        create: vi.fn().mockResolvedValue({ id: 'token-id' }),
      };

      const mockHashService = {
        randomToken: vi.fn().mockReturnValue('raw-random-token'),
        hash: vi.fn().mockReturnValue('sha256-hashed-token'),
      };

      const mockMailService = {
        sendMail: vi.fn().mockResolvedValue(true),
      };

      const useCase = new ForgotPassword({
        usersRepository: mockUsersRepo,
        userTokensRepository: mockUserTokensRepo,
        hashService: mockHashService,
        mailService: mockMailService,
      });

      const result = await useCase.execute({ email: 'jane@test.com' });

      expect(mockUserTokensRepo.revokeAllByUserId).toHaveBeenCalledWith('user-id', 'PASSWORD_RESET');
      expect(mockHashService.hash).toHaveBeenCalledWith('raw-random-token', 'sha256');
      expect(mockUserTokensRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user-id',
          token: 'sha256-hashed-token',
          type: 'PASSWORD_RESET',
        })
      );
      expect(mockMailService.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'jane@test.com',
          template: 'reset-password',
          variables: expect.objectContaining({
            token: 'raw-random-token',
          }),
        })
      );
      expect(result.message).toContain('instruções serão enviadas');
    });
  });

  describe('ResetPassword', () => {
    it('should throw AppError if token is invalid or expired', async () => {
      const mockUserTokensRepo = {
        findValidToken: vi.fn().mockResolvedValue(null),
      };

      const mockHashService = {
        hash: vi.fn().mockReturnValue('sha256-hashed-token'),
      };

      const useCase = new ResetPassword({
        userTokensRepository: mockUserTokensRepo,
        hashService: mockHashService,
      });

      await expect(
        useCase.execute({ token: 'invalid-token', password: 'NewPassword123!' })
      ).rejects.toThrow(AppError);
    });

    it('should hash new password, update user and mark token as used', async () => {
      const mockUserTokensRepo = {
        findValidToken: vi.fn().mockResolvedValue(
          new UserToken({
            id: 'token-uuid',
            userId: 'user-uuid',
            token: 'sha256-hashed-token',
            type: 'PASSWORD_RESET',
            expiresAt: new Date(Date.now() + 15 * 60 * 1000),
          })
        ),
        markAsUsed: vi.fn().mockResolvedValue(true),
      };

      const mockUsersRepo = {
        update: vi.fn().mockResolvedValue({ id: 'user-uuid' }),
      };

      const mockHashService = {
        hash: vi.fn().mockReturnValue('sha256-hashed-token'),
      };

      const mockPasswordHasher = {
        hash: vi.fn().mockResolvedValue('argon2-new-password-hash'),
      };

      const useCase = new ResetPassword({
        usersRepository: mockUsersRepo,
        userTokensRepository: mockUserTokensRepo,
        hashService: mockHashService,
        passwordHasher: mockPasswordHasher,
      });

      const result = await useCase.execute({
        token: 'valid-raw-token',
        password: 'NewPassword123!',
      });

      expect(mockPasswordHasher.hash).toHaveBeenCalledWith('NewPassword123!');
      expect(mockUserTokensRepo.findValidToken).toHaveBeenCalledWith(
        'sha256-hashed-token',
        ['PASSWORD_RESET', 'PASSWORD_SETUP'],
      );
      expect(mockUsersRepo.update).toHaveBeenCalledWith('user-uuid', {
        password: 'argon2-new-password-hash',
      });
      expect(mockUserTokensRepo.markAsUsed).toHaveBeenCalledWith('token-uuid');
      expect(result.message).toContain('com sucesso');
    });
  });
});
