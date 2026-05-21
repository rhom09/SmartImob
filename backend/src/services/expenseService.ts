import prisma from '../lib/prisma';

export interface CreateExpenseData {
  contratoId: string;
  tipo: 'IPTU' | 'CONDOMINIO' | 'AGUA' | 'LUZ' | 'OUTROS';
  descricao?: string;
  valor: number;
  dataVencimento: Date;
}

export interface UpdateExpenseData {
  tipo?: 'IPTU' | 'CONDOMINIO' | 'AGUA' | 'LUZ' | 'OUTROS';
  descricao?: string;
  valor?: number;
  dataVencimento?: Date;
  status?: 'PENDENTE' | 'PAGO';
}

export class ExpenseService {
  // ─── Criar Despesa ──────────────────────────────────────────────────
  static async create(data: CreateExpenseData) {
    // Validar se contrato existe
    const contract = await prisma.contract.findUnique({
      where: { id: data.contratoId },
    });
    if (!contract) throw new Error('Contrato não encontrado');

    return await prisma.expense.create({
      data: {
        contratoId: data.contratoId,
        tipo: data.tipo,
        descricao: data.descricao,
        valor: data.valor,
        dataVencimento: new Date(data.dataVencimento),
      },
    });
  }

  // ─── Listar Despesas com Filtros ────────────────────────────────────
  static async list(filters: {
    contratoId?: string;
    tipo?: string;
    status?: string;
    dataInicio?: string;
    dataFim?: string;
    page?: number;
    limit?: number;
  }) {
    const { contratoId, tipo, status, dataInicio, dataFim, page = 1, limit = 20 } = filters;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (contratoId) where.contratoId = contratoId;
    if (tipo) where.tipo = tipo;
    if (status) where.status = status;

    if (dataInicio || dataFim) {
      where.dataVencimento = {};
      if (dataInicio) where.dataVencimento.gte = new Date(dataInicio);
      if (dataFim) where.dataVencimento.lte = new Date(dataFim);
    }

    const [items, total] = await Promise.all([
      prisma.expense.findMany({
        where,
        skip,
        take: limit,
        orderBy: { dataVencimento: 'desc' },
        include: {
          contrato: {
            include: {
              imovel: true,
              inquilino: true,
            },
          },
        },
      }),
      prisma.expense.count({ where }),
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

  // ─── Buscar por ID ──────────────────────────────────────────────────
  static async getById(id: string) {
    return await prisma.expense.findUnique({
      where: { id },
      include: {
        contrato: {
          include: {
            imovel: { include: { owner: true } },
            inquilino: true,
          },
        },
      },
    });
  }

  // ─── Atualizar Despesa ──────────────────────────────────────────────
  static async update(id: string, data: UpdateExpenseData) {
    return await prisma.expense.update({
      where: { id },
      data: {
        ...(data.tipo && { tipo: data.tipo }),
        ...(data.descricao !== undefined && { descricao: data.descricao }),
        ...(data.valor !== undefined && { valor: data.valor }),
        ...(data.dataVencimento && { dataVencimento: new Date(data.dataVencimento) }),
        ...(data.status && { status: data.status }),
      },
    });
  }

  // ─── Excluir Despesa ────────────────────────────────────────────────
  static async delete(id: string) {
    return await prisma.expense.delete({ where: { id } });
  }

  // ─── Marcar como Paga ───────────────────────────────────────────────
  static async markAsPaid(id: string, dataPagamento?: Date) {
    return await prisma.expense.update({
      where: { id },
      data: {
        status: 'PAGO',
        dataPagamento: dataPagamento ? new Date(dataPagamento) : new Date(),
      },
    });
  }

  // ─── Total de Despesas por Contrato em Período ──────────────────────
  static async getTotalByContract(contratoId: string, dataInicio?: Date, dataFim?: Date) {
    const where: any = {
      contratoId,
      status: 'PAGO',
    };

    if (dataInicio || dataFim) {
      where.dataVencimento = {};
      if (dataInicio) where.dataVencimento.gte = dataInicio;
      if (dataFim) where.dataVencimento.lte = dataFim;
    }

    const result = await prisma.expense.aggregate({
      where,
      _sum: { valor: true },
    });

    return Number(result._sum.valor || 0);
  }
}
