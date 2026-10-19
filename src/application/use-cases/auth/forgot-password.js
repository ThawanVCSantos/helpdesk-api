export class ForgotPassword {
  constructor({ usersRepository, userTokensRepository, hashService, mailService }) {
    this.usersRepository = usersRepository;
    this.userTokensRepository = userTokensRepository;
    this.hashService = hashService;
    this.mailService = mailService;
  }

  async execute({ email }) {
    const user = await this.usersRepository.findByEmail(email);

    if (!user) {
      return { message: 'Se o e-mail estiver cadastrado, as instruções serão enviadas.' };
    }

    await this.userTokensRepository.revokeAllByUserId(user.id, 'PASSWORD_RESET');

    const rawToken = this.hashService.randomToken(32);
    const hashedToken = this.hashService.hash(rawToken, 'sha256');

    const minutes = Number(process.env.PASSWORD_RESET_TOKEN_EXPIRES_IN_MINUTES) || 15;
    const expiresAt = new Date(Date.now() + minutes * 60 * 1000);

    await this.userTokensRepository.create({
      userId: user.id,
      token: hashedToken,
      type: 'PASSWORD_RESET',
      expiresAt,
    });

    await this.mailService.sendMail({
      to: user.email,
      subject: 'Recuperação de Senha - HelpDesk',
      template: 'reset-password',
      variables: {
        name: user.name,
        token: rawToken,
        expiresInMinutes: minutes,
      },
    });

    return { message: 'Se o e-mail estiver cadastrado, as instruções serão enviadas.' };
  }
}
