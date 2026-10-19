import { ConflictError } from '../../../domain/errors/conflict-error.js';
import { NotFoundError } from '../../../domain/errors/not-found-error.js';
import { UserMapper } from '../../mappers/user-mapper.js';

export class CreateUser {
  constructor({ usersRepository, rolesRepository, userTokensRepository, hashService, mailService }) {
    this.usersRepository = usersRepository;
    this.rolesRepository = rolesRepository;
    this.userTokensRepository = userTokensRepository;
    this.hashService = hashService;
    this.mailService = mailService;
  }

  async execute({ name, email, roles = ['USER'] }) {
    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await this.usersRepository.findByEmail(normalizedEmail);
    if (existingUser) {
      throw new ConflictError('Já existe um usuário cadastrado com este e-mail');
    }

    const existingRoles = await this.rolesRepository.findByNames(roles);
    if (existingRoles.length !== new Set(roles).size) {
      const existingNames = new Set(existingRoles.map((role) => role.name));
      const missingRole = roles.find((role) => !existingNames.has(role));
      throw new NotFoundError(`Perfil de acesso (role) '${missingRole}' não encontrado`);
    }

    const createdUser = await this.usersRepository.create({
      name,
      email: normalizedEmail,
      password: null,
      active: true,
      roleNames: roles,
    });

    const rawToken = this.hashService.randomToken();
    const hashedToken = this.hashService.hash(rawToken, 'sha256');

    const minutes = Number(process.env.PASSWORD_RESET_TOKEN_EXPIRES_IN_MINUTES) || 15;
    const expiresAt = new Date(Date.now() + minutes * 60 * 1000);

    await this.userTokensRepository.create({
      userId: createdUser.id,
      token: hashedToken,
      type: 'PASSWORD_SETUP',
      expiresAt,
    });

    await this.mailService.sendMail({
      to: createdUser.email,
      subject: 'Bem-vindo ao HelpDesk - Configure sua senha',
      template: 'welcome-user',
      variables: {
        name: createdUser.name,
        token: rawToken,
        expiresInMinutes: minutes,
      },
    });

    return UserMapper.toDTO(createdUser);
  }
}
