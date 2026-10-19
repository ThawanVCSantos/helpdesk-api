import { BadRequestError } from '../../../domain/errors/bad-request-error.js';

export class ResetPassword {
  constructor({ usersRepository, userTokensRepository, hashService, passwordHasher }) {
    this.usersRepository = usersRepository;
    this.userTokensRepository = userTokensRepository;
    this.hashService = hashService;
    this.passwordHasher = passwordHasher;
  }

  async execute({ token, password }) {
    if (!token) {
      throw new BadRequestError('Token de recuperação é obrigatório', 'INVALID_TOKEN');
    }

    const hashedToken = this.hashService.hash(token, 'sha256');

    const userToken = await this.userTokensRepository.findValidToken(
      hashedToken,
      ['PASSWORD_RESET', 'PASSWORD_SETUP'],
    );

    if (!userToken || !userToken.isValid()) {
      throw new BadRequestError('Token inválido, expirado ou já utilizado', 'INVALID_OR_EXPIRED_TOKEN');
    }

    const hashedPassword = await this.passwordHasher.hash(password);

    await this.usersRepository.update(userToken.userId, { password: hashedPassword });

    await this.userTokensRepository.markAsUsed(userToken.id);

    return { message: 'Senha redefinida com sucesso!' };
  }
}
