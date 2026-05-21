import prisma from '../src/lib/prisma';

async function main() {
  const result = await prisma.$queryRawUnsafe(`
    SELECT column_name
    FROM information_schema.columns
    WHERE table_name = 'CONTRATOS' AND column_name = 'percentual_comissao'
  `);
  console.log('Resultado da verificação:', result);
}

main().catch(console.error).finally(() => prisma.$disconnect());
