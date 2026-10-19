import { NotFoundError } from '../../../domain/errors/not-found-error.js';
import { UserMapper } from '../../mappers/user-mapper.js';

export class GetUserProfile {
  constructor({ usersRepository }) {
    this.usersRepository = usersRepository;
  }

  async execute({ userId }) {
    const user = await this.usersRepository.findById(userId);

    if (!user) {
      throw new NotFoundError('Usuário não encontrado');
    }

    return UserMapper.toDTO(user);
  }
}
