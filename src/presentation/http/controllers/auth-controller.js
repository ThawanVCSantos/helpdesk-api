export class AuthController {
  constructor({
    authenticateUserUseCase,
    forgotPasswordUseCase,
    resetPasswordUseCase,
    getUserProfileUseCase,
  }) {
    this.authenticateUserUseCase = authenticateUserUseCase;
    this.forgotPasswordUseCase = forgotPasswordUseCase;
    this.resetPasswordUseCase = resetPasswordUseCase;
    this.getUserProfileUseCase = getUserProfileUseCase;
  }

  login = async (req, res, next) => {
    try {
      const { email, password } = req.body;
      const result = await this.authenticateUserUseCase.execute({ email, password });
      return res.status(200).json(result);
    } catch (error) {
      return next(error);
    }
  };

  forgotPassword = async (req, res, next) => {
    try {
      const { email } = req.body;
      const result = await this.forgotPasswordUseCase.execute({ email });
      return res.status(200).json(result);
    } catch (error) {
      return next(error);
    }
  };

  resetPassword = async (req, res, next) => {
    try {
      const { token, password } = req.body;
      const result = await this.resetPasswordUseCase.execute({ token, password });
      return res.status(200).json(result);
    } catch (error) {
      return next(error);
    }
  };

  me = async (req, res, next) => {
    try {
      const userId = req.user.id;
      const result = await this.getUserProfileUseCase.execute({ userId });
      return res.status(200).json(result);
    } catch (error) {
      return next(error);
    }
  };
}
