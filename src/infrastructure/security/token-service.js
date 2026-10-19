import jwt from 'jsonwebtoken';

export class JwtTokenService {
  constructor(secret = process.env.JWT_SECRET, expiresIn = process.env.JWT_EXPIRES_IN) {
    this.secret = secret;
    this.expiresIn = expiresIn;
  }

  generateToken(payload, options = {}) {
    return jwt.sign(payload, this.secret, {
      expiresIn: options.expiresIn || this.expiresIn,
      ...options,
    });
  }

  verifyToken(token) {
    try {
      return jwt.verify(token, this.secret);
    } catch {
      return null;
    }
  }
}

export const tokenService = new JwtTokenService();
