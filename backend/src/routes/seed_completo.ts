import { Router } from 'express';
import prisma from '../lib/prisma';
import { addDays, subMonths, addMonths } from 'date-fns';

const router = Router();

router.get('/completo', async (req, res) => {
  try {
    const imobiliarias = await prisma.imobiliaria.findMany();
    const imoRhom = imobiliarias.find(i => i.nome === 'Imobiliária Rhom') || imobiliarias[0];
    const imoAngelica = imobiliarias.find(i => i.nome === 'Imobiliária Angélica') || imobiliarias[1];

    // Limpeza Transacional
    /* await prisma.receipt.deleteMany();
    await prisma.adjustment.deleteMany();
    await prisma.alert.deleteMany();
    await prisma.expense.deleteMany();
    await prisma.contract.deleteMany();
    await prisma.interaction.deleteMany();
    await prisma.tenant.deleteMany();
    await prisma.propertyPhoto.deleteMany();
    await prisma.property.deleteMany();
    await prisma.owner.deleteMany(); */

    const tenants = ['Carlos Souza', 'Mariana Santos', 'Pedro Lima', 'Julia Rocha'];

    for (const imo of [imoRhom, imoAngelica]) {
      // Criar proprietários
      for (let i = 1; i <= 3; i++) {
        const cpf = `${i}${imo.nome.slice(0, 1)}000000000`.slice(0, 11);
        const owner = await prisma.owner.upsert({
          where: { cpfCnpj: cpf },
          update: {},
          create: { imobiliariaId: imo.id, nome: `Proprietário ${i} (${imo.nome})`, cpfCnpj: cpf, email: `prop${i}_${imo.nome.slice(0, 3)}@test.com` }
        });

        // Criar imóveis
        const status = i % 2 === 0 ? 'VAGO' : 'OCUPADO';
        const cod = `C-${imo.nome.slice(0, 3)}-${i}`;
        const prop = await prisma.property.upsert({
          where: { codigo: cod },
          update: { status },
          create: { imobiliariaId: imo.id, ownerId: owner.id, endereco: `Rua Teste ${i}`, valorLocacao: 2000 + (i * 500), status, codigo: cod }
        });

        if (status === 'OCUPADO') {
          const tenantCpf = `000000000${i}${imo.nome.slice(0, 1)}`;
          const tenant = await prisma.tenant.upsert({
            where: { cpfCnpj: tenantCpf },
            update: {},
            create: { imobiliariaId: imo.id, nome: tenants[i % tenants.length], cpfCnpj: tenantCpf, tipo: 'INQUILINO' }
          });

          const numContrato = `CT-${imo.nome.slice(0, 3)}-${i}`;
          const contract = await prisma.contract.upsert({
            where: { numeroContrato: numContrato },
            update: {},
            create: {
              imobiliariaId: imo.id, imovelId: prop.id, inquilinoId: tenant.id, numeroContrato: numContrato,
              dataInicio: subMonths(new Date(), 2), dataFim: i === 1 ? addDays(new Date(), 30) : addMonths(new Date(), 10),
              valorAluguel: Number(prop.valorLocacao || 0), diaVencimento: 10, status: 'ATIVO'
            }
          });
          // Recibos
          await prisma.receipt.create({ data: { imobiliariaId: imo.id, contratoId: contract.id, referenciaMes: 5, referenciaAno: 2026, valorBruto: 2500, valorLiquido: 2500, dataVencimento: subMonths(new Date(), 1), status: 'PAGO', numeroRecibo: `REC-${i}` } });
          await prisma.receipt.create({ data: { imobiliariaId: imo.id, contratoId: contract.id, referenciaMes: 6, referenciaAno: 2026, valorBruto: 2500, valorLiquido: 2500, dataVencimento: addDays(new Date(), 15), status: 'PENDENTE', numeroRecibo: `REC-PEND-${i}` } });
        }
      }
    }
    res.json({ message: 'Base de teste robusta populada com sucesso!' });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

export default router;