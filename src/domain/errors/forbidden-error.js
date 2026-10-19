import { AppError } from './app-error.js';

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden access', code = 'FORBIDDEN') {
    super(message, 403, code);
  }
}
