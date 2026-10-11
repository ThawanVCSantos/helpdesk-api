import { passwordHasher } from '../../src/infrastructure/security/password-hasher.js';

export async function seedInitialAdmin(db) {
  const existingAdmin = await db.userRole.findFirst({
    where: { role: { name: 'ADMIN' } },
    select: { userId: true },
  });

  if (existingAdmin) return;

  const email = process.env.INITIAL_ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.INITIAL_ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error('INITIAL_ADMIN_EMAIL and INITIAL_ADMIN_PASSWORD are required to create the first admin');
  }

  const existingUser = await db.user.findUnique({ where: { email } });
  if (existingUser) return;

  const passwordHash = await passwordHasher.hash(password);

  await db.user.create({
    data: {
      name: 'Administrador',
      email,
      password: passwordHash,
      active: true,
      roles: {
        create: {
          role: { connect: { name: 'ADMIN' } },
        },
      },
    },
  });
}
