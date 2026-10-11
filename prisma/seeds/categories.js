const categories = [
  { name: 'Hardware', description: 'Equipamentos e periféricos' },
  { name: 'Software', description: 'Aplicativos e sistemas' },
  { name: 'Rede', description: 'Conectividade e infraestrutura de rede' },
  { name: 'Acesso', description: 'Contas, permissões e autenticação' },
  { name: 'Outros', description: 'Solicitações não classificadas nas demais categorias' },
];

export async function seedCategories(db) {
  for (const category of categories) {
    await db.category.upsert({
      where: { name: category.name },
      update: {},
      create: category,
    });
  }
}
