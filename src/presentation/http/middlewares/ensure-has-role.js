import { ForbiddenError } from '../../../domain/errors/forbidden-error.js';
import { UnauthorizedError } from '../../../domain/errors/unauthorized-error.js';
import { hasAnyRole } from '../../../shared/utils/roles.js';

export function ensureHasRole(...requiredRoles) {
  const flattenedRoles = requiredRoles.flat();

  return (req, res, next) => {
    if (!req.user) {
      throw new UnauthorizedError('Usuário não autenticado');
    }

    if (!hasAnyRole(req.user.roles, flattenedRoles)) {
      throw new ForbiddenError('Acesso negado: permissões insuficientes');
    }

    return next();
  };
}
