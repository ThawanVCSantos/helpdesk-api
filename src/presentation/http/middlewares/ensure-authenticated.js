import { UnauthorizedError } from '../../../domain/errors/unauthorized-error.js';
import { tokenService as defaultTokenService } from '../../../infrastructure/security/token-service.js';

export function ensureAuthenticated(tokenService = defaultTokenService) {
  return (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedError('Token de autenticação não fornecido');
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      throw new UnauthorizedError('Formato de token inválido. Esperado: Bearer <token>');
    }

    const decoded = tokenService.verifyToken(parts[1]);

    if (!decoded) {
      throw new UnauthorizedError('Token inválido ou expirado');
    }

    req.user = {
      id: decoded.sub,
      email: decoded.email,
      roles: Array.isArray(decoded.roles) ? decoded.roles : [],
    };

    return next();
  };
}
