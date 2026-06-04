import prisma from '../lib/prisma';
import { addMonths, differenceInMonths, setDate, format, isBefore } from 'date-fns';
import { EmailService } from './emailService';

export interface CreateContractData {
  imovelId: string;
  inquilinoId: string;
  usuarioId?: string;
  numeroContrato: string;
  dataInicio: Date;
  dataFim: Date;
  valorAluguel: number;
  percentualComissao: number;
  diaVencimento: number;
  observacoes?: string;
}

export class ContractService {
  static async create(data: CreateContractData, imobiliariaId: string) {
    return await prisma.$transaction(async (tx) => {
      const property = await tx.property.findUnique({
        where: { id: data.imovelId, imobiliariaId },
      });

      if (!property) throw new Error('Imóvel não encontrado');
      if (property.status === 'OCUPADO') throw new Error('Imóvel já está ocupado');

      const tenant = await tx.tenant.findUnique({
        where: { id: data.inquilinoId, imobiliariaId },
      });

      if (!tenant) throw new Error('Inquilino não encontrado');

      const contract = await tx.contract.create({
        data: {
          imobiliariaId,
          imovelId: data.imovelId,
          inquilinoId: data.inquilinoId,
          usuarioId: data.usuarioId,
          numeroContrato: data.numeroContrato,
          dataInicio: data.dataInicio,
          dataFim: data.dataFim,
          valorAluguel: data.valorAluguel,
          percentualComissao: data.percentualComissao,
          diaVencimento: data.diaVencimento,
          observacoes: data.observacoes,
          status: 'ATIVO',
        },
      });

      await tx.property.update({
        where: { id: data.imovelId, imobiliariaId },
        data: { status: 'OCUPADO' },
      });

      const receipts = [];
      const totalMonths = differenceInMonths(data.dataFim, data.dataInicio) + 1;

      for (let i = 0; i < totalMonths; i++) {
        const dueDateBase = addMonths(data.dataInicio, i);
        let dueDate = setDate(dueDateBase, data.diaVencimento);

        if (i === 0 && isBefore(dueDate, data.dataInicio)) {
          dueDate = addMonths(dueDate, 1);
        }

        receipts.push({
          imobiliariaId,
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

  static async list(filters: any, imobiliariaId: string) {
    const { busca, status, page = 1, limit = 20 } = filters;
    const skip = (page - 1) * limit;

    const where: any = { imobiliariaId };
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

  static async applyAdjustment(id: string, data: { indice: any, percentual: number, novoValor: number, observacoes?: string }, imobiliariaId: string) {
    return await prisma.$transaction(async (tx) => {
      const contract = await tx.contract.findFirst({ where: { id, imobiliariaId } });
      if (!contract) throw new Error('Contrato não encontrado');

      const valorAnterior = contract.valorAluguel;

      const adjustment = await tx.adjustment.create({
        data: {
          imobiliariaId,
          contratoId: id,
          indice: data.indice,
          percentual: data.percentual,
          valorAnterior,
          novoValor: data.novoValor,
          dataReajuste: new Date(),
          observacoes: data.observacoes,
        }
      });

      await tx.contract.update({
        where: { id, imobiliariaId },
        data: { valorAluguel: data.novoValor }
      });

      await tx.receipt.updateMany({
        where: {
          contratoId: id,
          imobiliariaId,
          status: 'PENDENTE',
          dataVencimento: { gt: new Date() }
        },
        data: {
          valorBruto: data.novoValor,
          valorLiquido: data.novoValor
        }
      });

      return adjustment;
    });
  }

  static async getById(id: string, imobiliariaId: string) {
    return await prisma.contract.findFirst({
      where: { id, imobiliariaId },
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
