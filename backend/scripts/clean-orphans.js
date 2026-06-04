const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function reset() {
  console.log('🗑️ Apagando dados órfãos (sem imobiliariaId)...');
  await prisma.receipt.deleteMany({ where: { imobiliariaId: null } });
  await prisma.expense.deleteMany({ where: { imobiliariaId: null } });
  await prisma.contract.deleteMany({ where: { imobiliariaId: null } });
  await prisma.property.deleteMany({ where: { imobiliariaId: null } });
  await prisma.owner.deleteMany({ where: { imobiliariaId: null } });
  await prisma.tenant.deleteMany({ where: { imobiliariaId: null } });
  console.log('✅ Dados sem vínculo removidos.');
  await prisma.$disconnect();
}
reset();
