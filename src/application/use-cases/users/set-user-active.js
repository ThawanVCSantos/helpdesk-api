import { NotFoundError } from '../../../domain/errors/not-found-error.js';

export class SetUserActive {
  constructor({ usersRepository }) {
    this.usersRepository = usersRepository;
  }

  async execute({ id, active }) {
    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new NotFoundError('Usuário não encontrado');
    }

    await this.usersRepository.update(id, { active });
  }
}
