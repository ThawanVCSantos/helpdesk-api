import crypto from 'node:crypto';

export class CryptoHashService {
  hash(data, algorithm = 'sha256', encoding = 'hex') {
    return crypto.createHash(algorithm).update(data).digest(encoding);
  }

  randomToken(bytes = 32, encoding = 'hex') {
    return crypto.randomBytes(bytes).toString(encoding);
  }
}

export const hashService = new CryptoHashService();
