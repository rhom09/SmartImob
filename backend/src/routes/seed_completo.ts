import { Router } from 'express';
import prisma from '../lib/prisma';
import { addDays, subMonths, addMonths } from 'date-fns';

const router = Router();

router.get('/completo', async (req, res) => {
  try {
    const imobiliarias = await prisma.imobiliaria.findMany();
    const imoRhom = imobiliarias.find(i => i.nome === 'Imobiliária Rhom') || imobiliarias[0];
    const imoAngelica = imobiliarias.find(i => i.nome === 'Imobiliária Angélica') || imobiliarias[1];

    const tenants = ['Carlos Souza', 'Mariana Santos', 'Pedro Lima', 'Julia Rocha'];

    for (const imo of [imoRhom, imoAngelica]) {
      for (let i = 1; i <= 3; i++) {
        const cpf = `${i}${imo.nome.slice(0, 1)}000000000`.slice(0, 11);

        // UPSERT Proprietário
        const owner = await prisma.owner.upsert({
          where: { cpfCnpj: cpf },
          update: {},
          create: { imobiliariaId: imo.id, nome: `Proprietário ${i} (${imo.nome})`, cpfCnpj: cpf, email: `prop${i}@test.com` }
        });

        // UPSERT Imóvel
        const cod = `C-${imo.nome.slice(0, 3)}-${i}`;
        const prop = await prisma.property.upsert({
          where: { codigo: cod },
          update: { status: 'OCUPADO' },
          create: { imobiliariaId: imo.id, ownerId: owner.id, endereco: `Rua Teste ${i}`, valorLocacao: 2500, status: 'OCUPADO', codigo: cod }
        });

        // UPSERT Inquilino
        const tenantCpf = `000000000${i}${imo.nome.slice(0, 1)}`;
        const tenant = await prisma.tenant.upsert({
          where: { cpfCnpj: tenantCpf },
          update: {},
          create: { imobiliariaId: imo.id, nome: tenants[i], cpfCnpj: tenantCpf, tipo: 'INQUILINO' }
        });

        // UPSERT Contrato
        const numContrato = `CT-${imo.nome.slice(0, 3)}-${i}`;
        await prisma.contract.upsert({
          where: { numeroContrato: numContrato },
          update: {},
          create: {
            imobiliariaId: imo.id, imovelId: prop.id, inquilinoId: tenant.id, numeroContrato: numContrato,
            dataInicio: subMonths(new Date(), 2), dataFim: addMonths(new Date(), 10),
            valorAluguel: 2500, diaVencimento: 10, status: 'ATIVO'
          }
        });
      }
    }
    res.json({ message: 'Base populada com sucesso!' });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

export default router;
