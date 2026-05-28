import prisma from '../lib/prisma';
import { startOfMonth, endOfMonth, subMonths } from 'date-fns';

export class DashboardService {
  static async getMetrics() {
    const totalProperties = await prisma.property.count();
    const occupiedProperties = await prisma.property.count({ where: { status: 'OCUPADO' } });

    // Taxa de vacância simples: (Total - Ocupados) / Total
    const vacancyRate = totalProperties > 0 ? ((totalProperties - occupiedProperties) / totalProperties) * 100 : 0;

    const lastMonth = subMonths(new Date(), 1);
    const newContracts = await prisma.contract.count({
      where: {
        createdAt: { gte: lastMonth }
      }
    });

    const activeTenants = await prisma.tenant.count({
      where: { status: 'ATIVO', tipo: 'INQUILINO' }
    });

    return {
      totalProperties,
      vacancyRate: Number(vacancyRate.toFixed(1)),
      newContracts,
      activeTenants
    };
  }

  static async getChartData() {
    const propertiesByStatus = await prisma.property.groupBy({
      by: ['status'],
      _count: true
    });

    return {
      propertiesByStatus: propertiesByStatus.map(item => ({
        name: item.status,
        value: item._count
      }))
    };
  }

  static async getFinancialSummary() {
    const now = new Date();
    const startOfCurrentMonth = startOfMonth(now);

    const pendingReceivables = await prisma.receipt.aggregate({
      where: {
        status: 'PENDENTE',
        dataVencimento: { gte: startOfCurrentMonth }
      },
      _sum: { valorLiquido: true }
    });

    const overdueExpenses = await prisma.expense.aggregate({
      where: {
        status: 'PENDENTE',
        dataVencimento: { lt: now }
      },
      _sum: { valor: true }
    });

    return {
      pendingReceivables: pendingReceivables._sum.valorLiquido || 0,
      overdueExpenses: overdueExpenses._sum.valor || 0
    };
  }

  static async getFinancialEvolution() {
    const months = Array.from({ length: 6 }, (_, i) => subMonths(new Date(), i)).reverse();
    const evolution = await Promise.all(
      months.map(async (month) => {
        const start = startOfMonth(month);
        const end = endOfMonth(month);
        const receipts = await prisma.receipt.aggregate({
          where: { dataPagamento: { gte: start, lte: end }, status: 'PAGO' },
          _sum: { valorLiquido: true }
        });
        const expenses = await prisma.expense.aggregate({
          where: { dataPagamento: { gte: start, lte: end }, status: 'PAGO' },
          _sum: { valor: true }
        });
        return {
          month: month.toLocaleString('pt-BR', { month: 'short' }),
          receita: receipts._sum.valorLiquido || 0,
          despesa: expenses._sum.valor || 0
        };
      })
    );
    return evolution;
  }

  static async getOperationalAlerts() {
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    const alerts = await prisma.contract.findMany({
      where: {
        status: 'ATIVO',
        dataFim: { lte: nextMonth }
      },
      select: {
        id: true,
        numeroContrato: true,
        dataFim: true,
        inquilino: { select: { nome: true } },
        imovel: { select: { endereco: true } }
      }
    });
    return alerts;
  }
}
