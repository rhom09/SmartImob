const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seed() {
  const imobRhom = await prisma.imobiliaria.findFirst({ where: { nome: 'Imobiliária Rhom' } });
  const imobAngelica = await prisma.imobiliaria.findFirst({ where: { nome: 'Imobiliária Angélica' } });

  if (!imobRhom || !imobAngelica) {
    console.error('❌ Imobiliárias não encontradas. Rode o script de vínculo primeiro.');
    return;
  }

  // Seed Imobiliária Rhom
  const ownerRhom = await prisma.owner.create({
    data: { nome: 'Proprietário Rhom', cpfCnpj: '11111111111', imobiliariaId: imobRhom.id }
  });
  await prisma.property.create({
    data: { endereco: 'Rua Rhom, 1', ownerId: ownerRhom.id, imobiliariaId: imobRhom.id }
  });
  console.log('✅ Dados mockados da Imobiliária Rhom criados.');

  // Seed Imobiliária Angélica
  const ownerAngelica = await prisma.owner.create({
    data: { nome: 'Proprietário Angélica', cpfCnpj: '22222222222', imobiliariaId: imobAngelica.id }
  });
  await prisma.property.create({
    data: { endereco: 'Rua Angélica, 2', ownerId: ownerAngelica.id, imobiliariaId: imobAngelica.id }
  });
  console.log('✅ Dados mockados da Imobiliária Angélica criados.');

  await prisma.$disconnect();
}

seed().catch(console.error);
