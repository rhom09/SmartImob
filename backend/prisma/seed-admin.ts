import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const email = 'rhom0909@gmail.com';
  console.log(`👤 Criando/Atualizando usuário Admin para: ${email}`);

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      perfil: 'ADMIN',
      status: 'ATIVO',
    },
    create: {
      email,
      nome: 'Rhom Admin',
      supabaseId: 'mock-admin-id', // ID para casar com o nosso Mock Auth
      perfil: 'ADMIN',
      status: 'ATIVO',
    },
  });

  console.log(`✅ Usuário Admin pronto! ID: ${user.id}`);

  // Garantir que as preferências de notificação estejam ativas
  await prisma.notificationPreference.upsert({
    where: {
      usuarioId_tipoAlerta: {
        usuarioId: user.id,
        tipoAlerta: 'VENCIMENTO'
      }
    },
    update: { emailEnabled: true },
    create: {
      usuarioId: user.id,
      tipoAlerta: 'VENCIMENTO',
      emailEnabled: true
    }
  });

  console.log('🔔 Preferências de notificação configuradas para e-mail.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
