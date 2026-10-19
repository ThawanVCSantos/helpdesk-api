import { UserMapper } from '../../mappers/user-mapper.js';

export class ListUsers {
  constructor({ usersRepository }) {
    this.usersRepository = usersRepository;
  }

  async execute({ page = 1, limit = 10, active, search } = {}) {
    const { data, meta } = await this.usersRepository.list({ page, limit, active, search });

    return {
      data: UserMapper.toDTOList(data),
      meta,
    };
  }
}
