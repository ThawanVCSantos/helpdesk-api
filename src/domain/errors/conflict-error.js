import { AppError } from './app-error.js';

export class ConflictError extends AppError {
  constructor(message = 'Resource already exists', code = 'CONFLICT') {
    super(message, 409, code);
  }
}
