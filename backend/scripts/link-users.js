const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function linkTenants() {
  try {
    console.log('🔗 Criando imobiliárias e vinculando usuários...');

    // 1. Criar Imobiliária Rhom
    const imob1 = await prisma.imobiliaria.create({
      data: { nome: 'Imobiliária Rhom' }
    });
    await prisma.user.update({
      where: { id: '3b65669d-6489-4d2d-9f8b-d83570fc4468' },
      data: { imobiliariaId: imob1.id }
    });
    console.log('✅ Rhom Admin vinculado à Imobiliária Rhom:', imob1.id);

    // 2. Criar Imobiliária Angélica
    const imob2 = await prisma.imobiliaria.create({
      data: { nome: 'Imobiliária Angélica' }
    });
    await prisma.user.update({
      where: { id: '20e62a38-2ed9-4582-b71d-901fe1540081' },
      data: { imobiliariaId: imob2.id }
    });
    console.log('✅ Angélica Admin vinculada à Imobiliária Angélica:', imob2.id);

  } catch (e) {
    console.error('❌ Erro na vinculação:', e);
  } finally {
    await prisma.$disconnect();
  }
}

linkTenants();
