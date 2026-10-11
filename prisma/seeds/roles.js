const roles = [
  { name: 'USER', description: 'Usuário solicitante' },
  { name: 'AGENT', description: 'Agente de atendimento' },
  { name: 'ADMIN', description: 'Administrador do sistema' },
];

export async function seedRoles(db) {
  for (const role of roles) {
    await db.role.upsert({
      where: { name: role.name },
      update: {},
      create: role,
    });
  }
}
