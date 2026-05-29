import { PrismaClient } from '@prisma/client';
import { addDays } from 'date-fns';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Semeando dados variados para teste de notificações...');

  // 1. Proprietário adicional
  const owner = await prisma.owner.create({
    data: {
      nome: 'João da Silva Sauro',
      cpfCnpj: '22233344455',
      email: 'joao@sauro.com',
      telefone: '11911112222',
      endereco: 'Rua Pré-Histórica, 100, São Paulo - SP',
    }
  });

  // 2. Imóveis (Vago e Ocupado)
  const propVago = await prisma.property.create({
    data: {
      ownerId: owner.id,
      tipo: 'COMERCIAL',
      finalidade: 'LOCACAO',
      endereco: 'Av. Brigadeiro Faria Lima, 2000',
      bairro: 'Itaim Bibi',
      cidade: 'São Paulo',
      estado: 'SP',
      codigo: 'CM001',
      valorLocacao: 12000,
      status: 'VAGO',
      descricao: 'Laje corporativa moderna.',
    }
  });

  const propOcupado = await prisma.property.create({
    data: {
      ownerId: owner.id,
      tipo: 'APARTAMENTO',
      finalidade: 'LOCACAO',
      endereco: 'Alameda Santos, 1500',
      bairro: 'Cerqueira César',
      cidade: 'São Paulo',
      estado: 'SP',
      codigo: 'AP010',
      valorLocacao: 4500,
      status: 'OCUPADO',
      descricao: 'Próximo ao metrô Trianon-Masp.',
    }
  });

  // 3. Clientes (Inquilinos)
  const tenantA = await prisma.tenant.create({
    data: {
      nome: 'Empresa Tecnologia LTDA',
      cpfCnpj: '12345678000199',
      email: 'financeiro@tech.com',
      telefone: '1133334444',
      tipo: 'INQUILINO',
    }
  });

  const tenantB = await prisma.tenant.create({
    data: {
      nome: 'Roberto Carlos Braga',
      cpfCnpj: '55544433322',
      email: 'roberto@rei.com',
      telefone: '11988880000',
      tipo: 'INQUILINO',
    }
  });

  // 4. Contratos com VENCIMENTOS ESTRATÉGICOS

  // Contrato que vence em EXATAMENTE 30 dias (deve disparar alerta)
  const dataVencimentoAlerta = addDays(new Date(), 30);

  await prisma.contract.create({
    data: {
      imovelId: propOcupado.id,
      inquilinoId: tenantA.id,
      numeroContrato: 'NOTIF-30D-TEST',
      dataInicio: new Date('2023-01-01'),
      dataFim: dataVencimentoAlerta,
      valorAluguel: 12000,
      diaVencimento: 5,
      status: 'ATIVO',
      observacoes: 'Contrato teste para validação de alerta de 30 dias.'
    }
  });

  // Contrato que vence em 15 dias (já passou do gatilho de 30, mas deve aparecer no dashboard)
  await prisma.contract.create({
    data: {
      imovelId: propVago.id,
      inquilinoId: tenantB.id,
      numeroContrato: 'DASH-15D-TEST',
      dataInicio: new Date('2023-06-01'),
      dataFim: addDays(new Date(), 15),
      valorAluguel: 4500,
      diaVencimento: 15,
      status: 'ATIVO',
    }
  });

  console.log('✅ Seed de notificações finalizado!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
