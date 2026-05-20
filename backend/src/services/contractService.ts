import prisma from '../lib/prisma';
import { addMonths, differenceInMonths, setDate, format, isBefore } from 'date-fns';

export interface CreateContractData {
  imovelId: string;
  inquilinoId: string;
  usuarioId?: string;
  numeroContrato: string;
  dataInicio: Date;
  dataFim: Date;
  valorAluguel: number;
  diaVencimento: number;
  observacoes?: string;
}

export class ContractService {
  static async create(data: CreateContractData) {
    return await prisma.$transaction(async (tx) => {
      // 1. Validar se imóvel está disponível
      const property = await tx.property.findUnique({
        where: { id: data.imovelId },
      });

      if (!property) throw new Error('Imóvel não encontrado');
      if (property.status === 'OCUPADO') throw new Error('Imóvel já está ocupado');

      // 2. Validar inquilino
      const tenant = await tx.tenant.findUnique({
        where: { id: data.inquilinoId },
      });

      if (!tenant) throw new Error('Inquilino não encontrado');

      // 3. Criar o contrato
      const contract = await tx.contract.create({
        data: {
          imovelId: data.imovelId,
          inquilinoId: data.inquilinoId,
          usuarioId: data.usuarioId,
          numeroContrato: data.numeroContrato,
          dataInicio: data.dataInicio,
          dataFim: data.dataFim,
          valorAluguel: data.valorAluguel,
          diaVencimento: data.diaVencimento,
          observacoes: data.observacoes,
          status: 'ATIVO',
        },
      });

      // 4. Atualizar status do imóvel
      await tx.property.update({
        where: { id: data.imovelId },
        data: { status: 'OCUPADO' },
      });

      // 5. Gerar parcelas (Recibos)
      const receipts = [];
      let currentMonth = data.dataInicio;

      // Calcula a quantidade de meses (incluindo o parcial se houver)
      // Usamos differenceInMonths + 1 para garantir que cobrimos o período
      const totalMonths = differenceInMonths(data.dataFim, data.dataInicio) + 1;

      for (let i = 0; i < totalMonths; i++) {
        const dueDateBase = addMonths(data.dataInicio, i);
        let dueDate = setDate(dueDateBase, data.diaVencimento);

        // Se o dia de vencimento for menor que o dia de início no primeiro mês,
        // a parcela vence no mês seguinte?
        // Regra padrão: Se contrato começa dia 15 e vence dia 10, a primeira parcela vence no mês seguinte.
        if (i === 0 && isBefore(dueDate, data.dataInicio)) {
          dueDate = addMonths(dueDate, 1);
        }

        receipts.push({
          contratoId: contract.id,
          referenciaMes: dueDate.getMonth() + 1,
          referenciaAno: dueDate.getFullYear(),
          valorBruto: data.valorAluguel,
          valorLiquido: data.valorAluguel,
          dataVencimento: dueDate,
          status: 'PENDENTE' as const,
          numeroRecibo: `${contract.numeroContrato}-${(i + 1).toString().padStart(3, '0')}`,
        });
      }

      if (receipts.length > 0) {
        await tx.receipt.createMany({
          data: receipts,
        });
      }

      return {
        contract,
        receiptsCreated: receipts.length,
      };
    });
  }

  static async list(filters: any) {
    const { busca, status, page = 1, limit = 20 } = filters;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) where.status = status;
    if (busca) {
      where.OR = [
        { numeroContrato: { contains: busca, mode: 'insensitive' } },
        { inquilino: { nome: { contains: busca, mode: 'insensitive' } } },
        { imovel: { endereco: { contains: busca, mode: 'insensitive' } } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.contract.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          imovel: true,
          inquilino: true,
          _count: { select: { recibos: true } },
        },
      }),
      prisma.contract.count({ where }),
    ]);

    return {
      items,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getById(id: string) {
    return await prisma.contract.findUnique({
      where: { id },
      include: {
        imovel: { include: { owner: true } },
        inquilino: true,
        recibos: { orderBy: { dataVencimento: 'asc' } },
        reajustes: { orderBy: { dataReajuste: 'desc' } },
        despesas: { orderBy: { dataVencimento: 'asc' } },
      },
    });
  }
}
