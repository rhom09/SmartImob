import prisma from '../src/lib/prisma';
import { addMonths, subMonths, startOfMonth, subDays } from 'date-fns';

async function main() {
  console.log('--- Iniciando Seed de Massa de Dados ---');

  // Limpeza profunda
  await prisma.receipt.deleteMany();
  await prisma.adjustment.deleteMany();
  await prisma.alert.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.contract.deleteMany();
  await prisma.interaction.deleteMany();
  await prisma.tenant.deleteMany();
  await prisma.propertyPhoto.deleteMany();
  await prisma.property.deleteMany();
  await prisma.owner.deleteMany();

  // 1. Criar Proprietários (5)
  const owners = await Promise.all([
    prisma.owner.create({ data: { nome: 'Ricardo Almeida', cpfCnpj: '11111111111', email: 'ricardo@email.com', telefone: '11999990001', endereco: 'Rua A, 100' } }),
    prisma.owner.create({ data: { nome: 'Maria Silva', cpfCnpj: '22222222222', email: 'maria@email.com', telefone: '11999990002', endereco: 'Rua B, 200' } }),
    prisma.owner.create({ data: { nome: 'Carlos Souza', cpfCnpj: '33333333333', email: 'carlos@email.com', telefone: '11999990003', endereco: 'Rua C, 300' } }),
    prisma.owner.create({ data: { nome: 'Beatriz Oliveira', cpfCnpj: '44444444444', email: 'beatriz@email.com', telefone: '11999990004', endereco: 'Rua D, 400' } }),
    prisma.owner.create({ data: { nome: 'Fernando Santos', cpfCnpj: '55555555555', email: 'fernando@email.com', telefone: '11999990005', endereco: 'Rua E, 500' } }),
  ]);

  // 2. Criar Imóveis (10 - 2 por proprietário)
  const properties = [];
  for (let i = 0; i < 10; i++) {
    const prop = await prisma.property.create({
      data: {
        ownerId: owners[i % 5].id,
        tipo: i % 2 === 0 ? 'APARTAMENTO' : 'CASA',
        finalidade: 'LOCACAO',
        endereco: `Rua Teste ${i}, ${i * 10}`,
        valorLocacao: 2000 + (i * 500),
        status: i < 7 ? 'OCUPADO' : 'VAGO',
        codigo: `IMOB-${1000 + i}`
      }
    });
    properties.push(prop);
  }

  // 3. Criar Clientes (10 Inquilinos + 5 Interessados)
  const tenants = [];
  for (let i = 0; i < 15; i++) {
    const tenant = await prisma.tenant.create({
      data: {
        nome: `Cliente ${i + 1}`,
        cpfCnpj: `000000000${i}`,
        email: `cliente${i + 1}@email.com`,
        tipo: i < 10 ? 'INQUILINO' : 'INTERESSADO'
      }
    });
    tenants.push(tenant);
  }

  // 4. Criar Contratos (7 - vinculados aos 7 imóveis ocupados)
  // Cada contrato com comissão 8% ou 10%
  const comissoes = [8, 8, 8, 8, 10, 10, 10];
  for (let i = 0; i < 7; i++) {
    const contract = await prisma.contract.create({
      data: {
        imovelId: properties[i].id,
        inquilinoId: tenants[i].id,
        numeroContrato: `CT-${2025000 + i}`,
        dataInicio: subMonths(new Date(), 6),
        dataFim: addMonths(new Date(), 6),
        valorAluguel: Number(properties[i].valorLocacao),
        percentualComissao: comissoes[i],
        diaVencimento: 10,
        status: 'ATIVO'
      }
    });

    // Criar financeiro para cada contrato
    // 6 recibos passados (pagos) + 1 pendente (atrasado)
    for (let m = 1; m <= 6; m++) {
      await prisma.receipt.create({
        data: {
          contratoId: contract.id,
          referenciaMes: m,
          referenciaAno: 2026,
          valorBruto: contract.valorAluguel,
          valorLiquido: contract.valorAluguel,
          dataVencimento: new Date(2026, m - 1, 10),
          dataPagamento: new Date(2026, m - 1, 8),
          status: 'PAGO',
          numeroRecibo: `REC-${contract.numeroContrato}-${m}`
        }
      });
    }

    // Recibo atrasado (atual)
    await prisma.receipt.create({
      data: {
        contratoId: contract.id,
        referenciaMes: 4,
        referenciaAno: 2026,
        valorBruto: contract.valorAluguel,
        valorLiquido: contract.valorAluguel,
        dataVencimento: subDays(new Date(), 10),
        status: 'PENDENTE',
        numeroRecibo: `REC-${contract.numeroContrato}-7`
      }
    });

    // Despesa (IPTU)
    await prisma.expense.create({
      data: { contratoId: contract.id, tipo: 'IPTU', valor: 300, dataVencimento: new Date(), status: 'PENDENTE' }
    });
  }

  console.log('--- Seed de Massa Finalizado com sucesso! ---');
}

main().catch(e => console.error(e)).finally(async () => await prisma.$disconnect());
