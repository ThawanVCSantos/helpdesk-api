import { ForbiddenError } from '../../../domain/errors/forbidden-error.js';
import { UnauthorizedError } from '../../../domain/errors/unauthorized-error.js';

export function ensureHasRole(...requiredRoles) {
  return (req, res, next) => {
    if (!req.user) {
      throw new UnauthorizedError('Usuário não autenticado');
    }

    const userRoles = req.user.roles || [];
    const hasRole = requiredRoles.some((role) => userRoles.includes(role));

    if (!hasRole) {
      throw new ForbiddenError('Acesso negado: permissões insuficientes');
    }

    return next();
  };
}
