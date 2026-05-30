import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // SUBSTITUA este e-mail pelo seu segundo e-mail de teste
  const email = 'anglica.viana92@gmail.com';
  console.log(`👤 Criando Segundo Usuário Admin para: ${email}`);

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      perfil: 'MANAGER',
      status: 'ATIVO',
    },
    create: {
      email,
      nome: 'Segundo Gestor',
      supabaseId: 'mock-admin-id-2',
      perfil: 'MANAGER',
      status: 'ATIVO',
    },
  });

  console.log(`✅ Segundo Admin pronto! ID: ${user.id}`);

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

  console.log('🔔 Notificações ativadas para o segundo gestor.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
