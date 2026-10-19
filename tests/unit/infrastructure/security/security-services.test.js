import { describe, expect, it } from 'vitest';
import { CryptoHashService } from '../../../../src/infrastructure/security/hash-service.js';
import { JwtTokenService } from '../../../../src/infrastructure/security/token-service.js';

describe('security services', () => {
  it('hashes data and generates secure hexadecimal tokens', () => {
    const hash = new CryptoHashService();

    expect(hash.hash('value')).toHaveLength(64);
    expect(hash.randomToken()).toMatch(/^[a-f0-9]{64}$/);
  });

  it('signs, verifies and rejects JWTs', () => {
    const service = new JwtTokenService('a'.repeat(32), '1h');
    const token = service.generateToken({ sub: 'id' });

    expect(service.verifyToken(token).sub).toBe('id');
    expect(service.verifyToken('invalid')).toBeNull();
  });
});
