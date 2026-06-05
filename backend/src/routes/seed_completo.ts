import { Router } from 'express';
import prisma from '../lib/prisma';
import { addMonths, subMonths, startOfMonth } from 'date-fns';

const router = Router();

router.get('/completo', async (req, res) => {
  try {
    console.log('--- Iniciando Seed Completo Multi-Tenant ---');

    // Busca as imobiliárias existentes para o seed
    const imobiliarias = await prisma.imobiliaria.findMany();
    if (imobiliarias.length === 0) {
      return res.status(400).json({ error: 'Nenhuma imobiliária encontrada no banco. Crie as imobiliárias primeiro.' });
    }

    const imoRhom = imobiliarias.find(i => i.nome === 'Imobiliária Rhom') || imobiliarias[0];
    const imoAngelica = imobiliarias.find(i => i.nome === 'Imobiliária Angélica') || imobiliarias[imobiliarias.length > 1 ? 1 : 0];

    // Limpeza de tabelas transacionais (Preserva Users, Imobiliarias e NotificationPreferences)
    console.log('Limpando dados antigos...');
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

    // ─── SEED PARA IMOBILIÁRIA RHOM ───────────────────────────────────────
    console.log('Semeando dados para Imobiliária Rhom...');
    const o1 = await prisma.owner.create({ data: { imobiliariaId: imoRhom.id, nome: 'João da Silva', cpfCnpj: '12345678901', email: 'joao@email.com', telefone: '11999990001', endereco: 'Rua A, 1' } });
    const o2 = await prisma.owner.create({ data: { imobiliariaId: imoRhom.id, nome: 'Ana Costa', cpfCnpj: '98765432109', email: 'ana@email.com', telefone: '11999990002', endereco: 'Rua B, 2' } });

    const p1 = await prisma.property.create({
      data: {
        imobiliariaId: imoRhom.id, ownerId: o1.id, tipo: 'APARTAMENTO', finalidade: 'LOCACAO', endereco: 'Av. Paulista, 100',
        valorLocacao: 5000, valorCondominio: 800, valorIptu: 200, status: 'OCUPADO', codigo: 'AP-R001'
      }
    });
    const p2 = await prisma.property.create({
      data: {
        imobiliariaId: imoRhom.id, ownerId: o2.id, tipo: 'CASA', finalidade: 'LOCACAO', endereco: 'Rua das Flores, 50',
        valorLocacao: 3000, valorCondominio: 0, valorIptu: 150, status: 'OCUPADO', codigo: 'CA-R001'
      }
    });

    const t1 = await prisma.tenant.create({ data: { imobiliariaId: imoRhom.id, nome: 'Carlos Souza', cpfCnpj: '00011122233', email: 'carlos@email.com', telefone: '11988880001', tipo: 'INQUILINO' } });

    const c1 = await prisma.contract.create({
      data: {
        imobiliariaId: imoRhom.id, imovelId: p1.id, inquilinoId: t1.id, numeroContrato: 'CT-RHOM-001',
        dataInicio: subMonths(new Date(), 3), dataFim: addMonths(new Date(), 9),
        valorAluguel: 5000, diaVencimento: 10, status: 'ATIVO'
      }
    });

    await prisma.receipt.create({
      data: {
        imobiliariaId: imoRhom.id, contratoId: c1.id, referenciaMes: new Date().getMonth(), referenciaAno: new Date().getFullYear(), valorBruto: 5000, valorLiquido: 5000,
        dataVencimento: subMonths(new Date(), 1), dataPagamento: subMonths(new Date(), 1), status: 'PAGO', numeroRecibo: 'REC-RHOM-001'
      }
    });

    // ─── SEED PARA IMOBILIÁRIA ANGÉLICA ───────────────────────────────────
    console.log('Semeando dados para Imobiliária Angélica...');
    const o3 = await prisma.owner.create({ data: { imobiliariaId: imoAngelica.id, nome: 'Empresa XPTO', cpfCnpj: '11222333000199', email: 'contato@xpto.com', telefone: '21999990001', endereco: 'Av. Rio Branco, 100' } });

    const p3 = await prisma.property.create({
      data: {
        imobiliariaId: imoAngelica.id, ownerId: o3.id, tipo: 'SALA', finalidade: 'LOCACAO', endereco: 'Centro Comercial',
        valorLocacao: 8000, valorCondominio: 1200, valorIptu: 400, status: 'OCUPADO', codigo: 'SA-A001'
      }
    });

    const t3 = await prisma.tenant.create({ data: { imobiliariaId: imoAngelica.id, nome: 'Startup Tech', cpfCnpj: '44555666000188', email: 'finances@startup.com', telefone: '21988880001', tipo: 'INQUILINO' } });

    const c3 = await prisma.contract.create({
      data: {
        imobiliariaId: imoAngelica.id, imovelId: p3.id, inquilinoId: t3.id, numeroContrato: 'CT-ANG-001',
        dataInicio: subMonths(new Date(), 1), dataFim: addMonths(new Date(), 11),
        valorAluguel: 8000, diaVencimento: 5, status: 'ATIVO'
      }
    });

    await prisma.receipt.create({
      data: {
        imobiliariaId: imoAngelica.id, contratoId: c3.id, referenciaMes: new Date().getMonth(), referenciaAno: new Date().getFullYear(), valorBruto: 8000, valorLiquido: 8000,
        dataVencimento: new Date(), status: 'PENDENTE', numeroRecibo: 'REC-ANG-001'
      }
    });

    console.log('--- Seed Completo com sucesso ---');
    return res.json({ message: 'Base de teste robusta e isolada criada com sucesso!' });
  } catch (error: any) {
    console.error('Erro no seed:', error);
    return res.status(500).json({ error: error.message });
  }
});

export default router;
