import { Router } from 'express';
import prisma from '../lib/prisma';
import { addMonths, subMonths } from 'date-fns';

const router = Router();

router.get('/', async (req, res) => {
  try {
    console.log('Limpando banco de dados...');
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

    console.log('Semeando dados de teste básicos...');

    const imobiliarias = await prisma.imobiliaria.findMany();
    if (imobiliarias.length === 0) {
      return res.status(400).json({ error: 'Nenhuma imobiliária encontrada no banco.' });
    }
    const imoRhom = imobiliarias.find(i => i.nome === 'Imobiliária Rhom') || imobiliarias[0];

    // 1. Proprietários
    const owner1 = await prisma.owner.create({
      data: {
        imobiliariaId: imoRhom.id,
        nome: 'Ricardo Almeida',
        cpfCnpj: '12345678901',
        email: 'ricardo@email.com',
        telefone: '11988887777',
        endereco: 'Av. Paulista, 1000, São Paulo - SP',
      }
    });

    const owner2 = await prisma.owner.create({
      data: {
        imobiliariaId: imoRhom.id,
        nome: 'Dona Maria Silva',
        cpfCnpj: '98765432109',
        email: 'maria@email.com',
        telefone: '11999998888',
        endereco: 'Rua das Palmeiras, 50, São Paulo - SP',
      }
    });

    // 2. Imóveis
    const prop1 = await prisma.property.create({
      data: {
        imobiliariaId: imoRhom.id,
        ownerId: owner1.id,
        tipo: 'APARTAMENTO',
        finalidade: 'LOCACAO',
        endereco: 'Rua das Flores, 123',
        bairro: 'Jardim América',
        cidade: 'São Paulo',
        estado: 'SP',
        cep: '01415000',
        codigo: 'AP001',
        valorLocacao: 3500,
        status: 'OCUPADO',
        descricao: 'Apartamento aconchegante com 2 quartos.',
      }
    });

    const prop2 = await prisma.property.create({
      data: {
        imobiliariaId: imoRhom.id,
        ownerId: owner1.id,
        tipo: 'CASA',
        finalidade: 'LOCACAO',
        endereco: 'Rua dos Pinheiros, 456',
        bairro: 'Pinheiros',
        cidade: 'São Paulo',
        estado: 'SP',
        cep: '05422000',
        codigo: 'CA001',
        valorLocacao: 8500,
        status: 'VAGO',
        descricao: 'Casa ampla com 3 quartos e quintal.',
      }
    });

    // 3. Clientes
    const tenant1 = await prisma.tenant.create({
      data: {
        imobiliariaId: imoRhom.id,
        nome: 'Mariana Santos',
        cpfCnpj: '98765432100',
        email: 'mariana@email.com',
        telefone: '11977776666',
        tipo: 'INQUILINO',
      }
    });

    const lead1 = await prisma.tenant.create({
      data: {
        imobiliariaId: imoRhom.id,
        nome: 'Carlos Eduardo',
        cpfCnpj: '11122233344',
        email: 'cadu@email.com',
        telefone: '11955554444',
        tipo: 'INTERESSADO',
      }
    });

    // 4. Interação
    await prisma.interaction.create({
      data: {
        tenantId: lead1.id,
        tipo: 'WHATSAPP',
        descricao: 'Solicitou fotos adicionais da Casa de Pinheiros.',
        data: new Date(),
      }
    });

    // 5. Contrato
    const contract = await prisma.contract.create({
      data: {
        imobiliariaId: imoRhom.id,
        imovelId: prop1.id,
        inquilinoId: tenant1.id,
        numeroContrato: 'CNT-2024-001',
        dataInicio: subMonths(new Date(), 6),
        dataFim: addMonths(new Date(), 6),
        valorAluguel: 3500,
        diaVencimento: 10,
        status: 'ATIVO',
      }
    });

    // 6. Recibos
    await prisma.receipt.create({
      data: {
        imobiliariaId: imoRhom.id,
        contratoId: contract.id,
        referenciaMes: subMonths(new Date(), 1).getMonth() + 1,
        referenciaAno: subMonths(new Date(), 1).getFullYear(),
        valorBruto: 3500,
        valorLiquido: 3500,
        dataVencimento: subMonths(new Date(), 1),
        dataPagamento: subMonths(new Date(), 1),
        status: 'PAGO',
        numeroRecibo: 'CNT-2024-001-001',
      }
    });

    await prisma.receipt.create({
      data: {
        imobiliariaId: imoRhom.id,
        contratoId: contract.id,
        referenciaMes: new Date().getMonth() + 1,
        referenciaAno: new Date().getFullYear(),
        valorBruto: 3500,
        valorLiquido: 3500,
        dataVencimento: new Date(),
        status: 'PENDENTE',
        numeroRecibo: 'CNT-2024-001-002',
      }
    });

    return res.json({ message: 'Seed finalizado com sucesso!' });
  } catch (error) {
    console.error('Erro no seed:', error);
    return res.status(500).json({ error: 'Erro ao popular banco de dados' });
  }
});

export default router;
