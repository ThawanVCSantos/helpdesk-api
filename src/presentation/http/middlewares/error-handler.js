import { ZodError } from 'zod';
import { AppError } from '../../../domain/errors/app-error.js';
import { logger } from '../../../infrastructure/logging/logger.js';

export function errorHandlerMiddleware(err, req, res, _next) {
  if (err instanceof AppError) {
    const response = {
      status: 'error',
      code: err.code,
      message: err.message,
    };

    if (err.details) {
      response.details = err.details;
    }

    return res.status(err.statusCode).json(response);
  }

  if (err instanceof ZodError) {
    const formattedErrors = err.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    }));

    return res.status(422).json({
      status: 'error',
      code: 'VALIDATION_ERROR',
      message: 'Dados inválidos fornecidos',
      errors: formattedErrors,
    });
  }

  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      status: 'error',
      code: 'INVALID_JSON',
      message: 'JSON malformado no corpo da requisição',
    });
  }

  logger.error('Unhandled internal error', {
    error: err.message,
    stack: err.stack,
    method: req.method,
    path: req.originalUrl,
  });

  return res.status(500).json({
    status: 'error',
    code: 'INTERNAL_SERVER_ERROR',
    message: 'Ocorreu um erro interno no servidor',
  });
}
