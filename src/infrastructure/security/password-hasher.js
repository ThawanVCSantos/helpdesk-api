import argon2 from 'argon2';

const ARGON2_OPTIONS = {
  type: argon2.argon2id,
  memoryCost: 19456,
  timeCost: 2,
  parallelism: 1,
};

export class Argon2PasswordHasher {
  async hash(password) {
    return argon2.hash(password, ARGON2_OPTIONS);
  }

  async verify(hash, password) {
    return argon2.verify(hash, password);
  }
}

export const passwordHasher = new Argon2PasswordHasher();
