import { Router } from 'express';
import prisma from '../lib/prisma';
import { addDays, subMonths, addMonths } from 'date-fns';

const router = Router();

router.get('/completo', async (req, res) => {
  try {
    const targetImoId = '87437a4c-0fe2-4d92-85c6-0958a114085f';
    const tenants = ['Carlos Souza', 'Mariana Santos', 'Pedro Lima', 'Julia Rocha'];

    for (let i = 1; i <= 3; i++) {
        const cpf = `1110000000${i}`.slice(0, 11);

        // UPSERT Proprietário
        const owner = await prisma.owner.upsert({
          where: { cpfCnpj: cpf },
          update: {},
          create: { imobiliariaId: targetImoId, nome: `Proprietário ${i} (Rhom)`, cpfCnpj: cpf, email: `prop${i}@test.com` }
        });

        // UPSERT Imóvel
        const cod = `C-RHO-${i}`;
        const prop = await prisma.property.upsert({
          where: { codigo: cod },
          update: { status: 'OCUPADO' },
          create: { imobiliariaId: targetImoId, ownerId: owner.id, endereco: `Rua Teste ${i}`, valorLocacao: 2500, status: 'OCUPADO', codigo: cod }
        });

        // UPSERT Inquilino
        const tenantCpf = `2220000000${i}`.slice(0, 11);
        const tenant = await prisma.tenant.upsert({
          where: { cpfCnpj: tenantCpf },
          update: {},
          create: { imobiliariaId: targetImoId, nome: tenants[i], cpfCnpj: tenantCpf, tipo: 'INQUILINO' }
        });

        // UPSERT Contrato
        const numContrato = `CT-RHOM-00${i}`;
        const contract = await prisma.contract.upsert({
          where: { numeroContrato: numContrato },
          update: {},
          create: {
            imobiliariaId: targetImoId, imovelId: prop.id, inquilinoId: tenant.id, numeroContrato: numContrato,
            dataInicio: subMonths(new Date(), 2), dataFim: addMonths(new Date(), 10),
            valorAluguel: 2500, diaVencimento: 10, status: 'ATIVO'
          }
        });

        // Garantir recibos para este contrato na imobiliária correta
        for (let m = 1; m <= 3; m++) {
          const refMes = m;
          const refAno = 2026;
          const receiptNum = `REC-${numContrato}-${m}`;
          await prisma.receipt.upsert({
            where: { numeroRecibo: receiptNum },
            update: { status: 'PAGO', dataPagamento: new Date() },
            create: {
              imobiliariaId: targetImoId, contratoId: contract.id, numeroRecibo: receiptNum,
              referenciaMes: refMes, referenciaAno: refAno, valorBruto: 2500, valorLiquido: 2500,
              dataVencimento: new Date(2026, m-1, 10), status: 'PAGO', dataPagamento: new Date(2026, m-1, 10)
            }
          });
        }
      }
    res.json({ message: 'Base da Rhom populada/corrigida com sucesso!' });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

export default router;
