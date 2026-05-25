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
    // Exemplo: Dados para o gráfico de pizza de Status dos Imóveis
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
}
