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

  static async getFinancialSummary(req: Request, res: Response) {
    try {
      const summary = await DashboardService.getFinancialSummary();
      res.json(summary);
    } catch (error) {
      console.error('Erro ao buscar resumo financeiro:', error);
      res.status(500).json({ error: 'Erro ao buscar resumo financeiro' });
    }
  }

  static async getFinancialEvolution(req: Request, res: Response) {
    try {
      const evolution = await DashboardService.getFinancialEvolution();
      res.json(evolution);
    } catch (error) {
      console.error('Erro ao buscar evolução financeira:', error);
      res.status(500).json({ error: 'Erro ao buscar evolução financeira' });
    }
  }

  static async getOperationalAlerts(req: Request, res: Response) {
    try {
      const alerts = await DashboardService.getOperationalAlerts();
      res.json(alerts);
    } catch (error) {
      console.error('Erro ao buscar alertas operacionais:', error);
      res.status(500).json({ error: 'Erro ao buscar alertas operacionais' });
    }
  }
}
