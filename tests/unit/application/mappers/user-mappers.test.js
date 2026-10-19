import { describe, expect, it } from 'vitest';
import { UserMapper } from '../../../../src/application/mappers/user-mapper.js';
import { UserTokenMapper } from '../../../../src/application/mappers/user-token-mapper.js';
import { User } from '../../../../src/domain/entities/user.js';

const user = () => new User({
  id: 'user-id',
  name: 'Maria',
  email: 'maria@example.com',
  active: true,
  roles: ['USER'],
});

describe('UserMapper', () => {
  it('maps users to safe DTOs and handles empty values', () => {
    const domainUser = user();
    domainUser.password = 'secret';

    expect(UserMapper.toDTO(domainUser)).not.toHaveProperty('password');
    expect(UserMapper.toDTOList([domainUser])).toHaveLength(1);
    expect(UserMapper.toDomain(null)).toBeNull();
    expect(UserMapper.toDTO(null)).toBeNull();
  });
});

describe('UserTokenMapper', () => {
  it('handles empty values', () => {
    expect(UserTokenMapper.toDomain(null)).toBeNull();
  });
});
