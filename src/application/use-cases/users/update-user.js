import { NotFoundError } from '../../../domain/errors/not-found-error.js';
import { ConflictError } from '../../../domain/errors/conflict-error.js';
import { UserMapper } from '../../mappers/user-mapper.js';

export class UpdateUser {
  constructor({ usersRepository, rolesRepository }) {
    this.usersRepository = usersRepository;
    this.rolesRepository = rolesRepository;
  }

  async execute({ id, name, email, roles }) {
    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new NotFoundError('Usuário não encontrado');
    }

    const normalizedEmail = email?.toLowerCase().trim();
    if (normalizedEmail && normalizedEmail !== user.email) {
      const existingUser = await this.usersRepository.findByEmail(normalizedEmail);
      if (existingUser && existingUser.id !== id) {
        throw new ConflictError('Já existe um usuário cadastrado com este e-mail');
      }
    }

    if (roles && Array.isArray(roles)) {
      const existingRoles = await this.rolesRepository.findByNames(roles);
      if (existingRoles.length !== new Set(roles).size) {
        const existingNames = new Set(existingRoles.map((role) => role.name));
        const missingRole = roles.find((role) => !existingNames.has(role));
        throw new NotFoundError(`Perfil de acesso (role) '${missingRole}' não encontrado`);
      }
    }

    const updatedUser = await this.usersRepository.update(id, {
      name,
      email: normalizedEmail,
      roleNames: roles,
    });

    return UserMapper.toDTO(updatedUser);
  }
}
