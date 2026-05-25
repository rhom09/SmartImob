import { Request, Response } from 'express';
import { DashboardService } from '../services/dashboardService';

export class DashboardController {
  static async getDashboardData(req: Request, res: Response) {
    try {
      const metrics = await DashboardService.getMetrics();
      res.json(metrics);
    } catch (error) {
      console.error('Erro ao buscar estatísticas do dashboard:', error);
      res.status(500).json({ error: 'Erro ao buscar estatísticas do dashboard' });
    }
  }

  static async getChartData(req: Request, res: Response) {
    try {
      const charts = await DashboardService.getChartData();
      res.json(charts);
    } catch (error) {
      console.error('Erro ao buscar dados de gráficos do dashboard:', error);
      res.status(500).json({ error: 'Erro ao buscar dados de gráficos' });
    }
  }
}
