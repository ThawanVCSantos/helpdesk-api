export class UsersController {
  constructor({
    createUserUseCase,
    listUsersUseCase,
    getUserProfileUseCase,
    updateUserUseCase,
    setUserActiveUseCase,
  }) {
    this.createUserUseCase = createUserUseCase;
    this.listUsersUseCase = listUsersUseCase;
    this.getUserProfileUseCase = getUserProfileUseCase;
    this.updateUserUseCase = updateUserUseCase;
    this.setUserActiveUseCase = setUserActiveUseCase;
  }

  create = async (req, res, next) => {
    try {
      const { name, email, roles } = req.body;
      const user = await this.createUserUseCase.execute({ name, email, roles });
      return res.status(201).json(user);
    } catch (error) {
      return next(error);
    }
  };

  list = async (req, res, next) => {
    try {
      const { page, limit, active, search } = req.validated.query;
      const result = await this.listUsersUseCase.execute({
        page,
        limit,
        active,
        search,
      });
      return res.status(200).json(result);
    } catch (error) {
      return next(error);
    }
  };

  getById = async (req, res, next) => {
    try {
      const { id } = req.params;
      const user = await this.getUserProfileUseCase.execute({ userId: id });
      return res.status(200).json(user);
    } catch (error) {
      return next(error);
    }
  };

  update = async (req, res, next) => {
    try {
      const { id } = req.params;
      const { name, email, roles } = req.body;
      const updatedUser = await this.updateUserUseCase.execute({ id, name, email, roles });
      return res.status(200).json(updatedUser);
    } catch (error) {
      return next(error);
    }
  };

  setActive = async (req, res, next) => {
    try {
      const { id } = req.params;
      const { active } = req.body;
      await this.setUserActiveUseCase.execute({ id, active });
      return res.status(204).send();
    } catch (error) {
      return next(error);
    }
  };
}
