import { UnauthorizedError } from '../../../domain/errors/unauthorized-error.js';

export class AuthenticateUser {
  constructor({ usersRepository, passwordHasher, tokenService }) {
    this.usersRepository = usersRepository;
    this.passwordHasher = passwordHasher;
    this.tokenService = tokenService;
  }

  async execute({ email, password }) {
    const user = await this.usersRepository.findByEmail(email);

    if (!user) {
      throw new UnauthorizedError('Credenciais inválidas');
    }

    const isPasswordValid = user.active && user.password
      ? await this.passwordHasher.verify(user.password, password)
      : false;
    if (!isPasswordValid) {
      throw new UnauthorizedError('Credenciais inválidas');
    }

    const token = this.tokenService.generateToken({
      sub: user.id,
      email: user.email,
      roles: user.roles,
    });

    return { token };
  }
}
