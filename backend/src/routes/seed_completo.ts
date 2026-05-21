import { Router } from 'express';
import prisma from '../lib/prisma';
import { addMonths, subMonths, startOfMonth } from 'date-fns';

const router = Router();

router.get('/completo', async (req, res) => {
  try {
    console.log('--- Iniciando Seed Completo ---');

    // 1. Proprietários
    const o1 = await prisma.owner.create({ data: { nome: 'João da Silva', cpfCnpj: '12345678901', email: 'joao@email.com', telefone: '11999990001', endereco: 'Rua A, 1' } });
    const o2 = await prisma.owner.create({ data: { nome: 'Ana Costa', cpfCnpj: '98765432109', email: 'ana@email.com', telefone: '11999990002', endereco: 'Rua B, 2' } });

    // 2. Imóveis
    const p1 = await prisma.property.create({
      data: {
        ownerId: o1.id, tipo: 'APARTAMENTO', finalidade: 'LOCACAO', endereco: 'Av. Paulista, 100',
        valorLocacao: 5000, valorCondominio: 800, valorIptu: 200, status: 'OCUPADO', codigo: 'AP-001'
      }
    });
    const p2 = await prisma.property.create({
      data: {
        ownerId: o2.id, tipo: 'CASA', finalidade: 'LOCACAO', endereco: 'Rua das Flores, 50',
        valorLocacao: 3000, valorCondominio: 0, valorIptu: 150, status: 'OCUPADO', codigo: 'CA-001'
      }
    });

    // 3. Clientes
    const t1 = await prisma.tenant.create({ data: { nome: 'Carlos Souza', cpfCnpj: '00011122233', email: 'carlos@email.com', telefone: '11988880001', tipo: 'INQUILINO' } });
    const t2 = await prisma.tenant.create({ data: { nome: 'Beatriz Lima', cpfCnpj: '33322211100', email: 'beatriz@email.com', telefone: '11988880002', tipo: 'INQUILINO' } });

    // 4. Contratos
    const c1 = await prisma.contract.create({
      data: {
        imovelId: p1.id, inquilinoId: t1.id, numeroContrato: 'CT-001',
        dataInicio: subMonths(new Date(), 3), dataFim: addMonths(new Date(), 9),
        valorAluguel: 5000, diaVencimento: 10, status: 'ATIVO'
      }
    });

    const c2 = await prisma.contract.create({
      data: {
        imovelId: p2.id, inquilinoId: t2.id, numeroContrato: 'CT-002',
        dataInicio: subMonths(new Date(), 2), dataFim: addMonths(new Date(), 10),
        valorAluguel: 3000, diaVencimento: 5, status: 'ATIVO'
      }
    });

    // 5. Financeiro - Recibos
    // Recibo 1 (Pago)
    await prisma.receipt.create({
      data: {
        contratoId: c1.id, referenciaMes: 2, referenciaAno: 2026, valorBruto: 5000, valorLiquido: 5000,
        dataVencimento: new Date('2026-02-10'), dataPagamento: new Date('2026-02-08'), status: 'PAGO', numeroRecibo: 'REC-001'
      }
    });

    // Recibo 2 (Vencido/Inadimplente)
    await prisma.receipt.create({
      data: {
        contratoId: c1.id, referenciaMes: 3, referenciaAno: 2026, valorBruto: 5000, valorLiquido: 5000,
        dataVencimento: new Date('2026-03-10'), status: 'PENDENTE', numeroRecibo: 'REC-002'
      }
    });

    // Recibo 3 (Vencido/Inadimplente)
    await prisma.receipt.create({
      data: {
        contratoId: c2.id, referenciaMes: 4, referenciaAno: 2026, valorBruto: 3000, valorLiquido: 3000,
        dataVencimento: new Date('2026-04-05'), status: 'PENDENTE', numeroRecibo: 'REC-003'
      }
    });

    // 6. Despesas
    await prisma.expense.create({
      data: {
        contratoId: c1.id, tipo: 'IPTU', valor: 200, dataVencimento: new Date('2026-04-10'), status: 'PENDENTE'
      }
    });

    console.log('--- Seed Completo com sucesso ---');
    return res.json({ message: 'Base de teste robusta criada!' });
  } catch (error: any) {
    console.error('Erro no seed:', error);
    return res.status(500).json({ error: error.message });
  }
});

export default router;
