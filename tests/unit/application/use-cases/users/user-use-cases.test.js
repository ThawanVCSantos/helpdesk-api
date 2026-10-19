import { describe, expect, it, vi } from 'vitest';
import { User } from '../../../../../src/domain/entities/user.js';
import { GetUserProfile } from '../../../../../src/application/use-cases/users/get-user-profile.js';
import { ListUsers } from '../../../../../src/application/use-cases/users/list-users.js';
import { SetUserActive } from '../../../../../src/application/use-cases/users/set-user-active.js';
import { UpdateUser } from '../../../../../src/application/use-cases/users/update-user.js';

const user = () => new User({
  id: 'user-id',
  name: 'Maria',
  email: 'maria@example.com',
  active: true,
  roles: ['USER'],
});

describe('user use cases', () => {
  it('gets a profile, lists users and changes active status', async () => {
    const repository = {
      findById: vi.fn().mockResolvedValue(user()),
      list: vi.fn().mockResolvedValue({ data: [user()], meta: { total: 1 } }),
      update: vi.fn().mockResolvedValue(user()),
    };

    expect((await new GetUserProfile({ usersRepository: repository }).execute({ userId: 'user-id' })).id).toBe('user-id');
    expect((await new ListUsers({ usersRepository: repository }).execute()).data).toHaveLength(1);
    await new SetUserActive({ usersRepository: repository }).execute({ id: 'user-id', active: false });
    expect(repository.update).toHaveBeenCalledWith('user-id', { active: false });
  });

  it('updates user email and roles', async () => {
    const repository = {
      findById: vi.fn().mockResolvedValue(user()),
      findByEmail: vi.fn().mockResolvedValue(null),
      update: vi.fn().mockResolvedValue(user()),
    };
    const rolesRepository = {
      findByNames: vi.fn().mockResolvedValue([{ name: 'ADMIN' }]),
    };

    await new UpdateUser({ usersRepository: repository, rolesRepository }).execute({
      id: 'user-id',
      name: 'Ana',
      email: 'ANA@example.com',
      roles: ['ADMIN'],
    });

    expect(repository.update).toHaveBeenCalledWith('user-id', {
      name: 'Ana',
      email: 'ana@example.com',
      roleNames: ['ADMIN'],
    });
  });
});
