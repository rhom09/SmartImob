const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    // SUBSTITUA o e-mail e o ID conforme indicado abaixo
    const email = 'anglica.viana92@gmail.com';
    const supabaseId = '781ae534-577e-4d87-a13d-e6dcd5325eae';

    console.log(`👤 Sincronizando usuário: ${email}`);

    try {
        const user = await prisma.user.upsert({
            where: { email },
            update: { status: 'ATIVO', perfil: 'ADMIN' },
            create: {
                email,
                nome: 'Angelica Viana',
                supabaseId,
                perfil: 'ADMIN',
                status: 'ATIVO',
            },
        });
        console.log('✅ Usuário sincronizado com sucesso:', user);
    } catch (e) {
        console.error('❌ Erro ao sincronizar:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();