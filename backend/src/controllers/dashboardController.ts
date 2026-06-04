import { Request, Response } from 'express';
import { DashboardService } from '../services/dashboardService';

export class DashboardController {
  static async getDashboardData(req: Request, res: Response) {
    try {
      const imobiliariaId = (req as any).user.imobiliariaId;
      if (!imobiliariaId) return res.status(403).json({ error: 'Imobiliária não vinculada' });
      const metrics = await DashboardService.getMetrics(imobiliariaId);
      res.json(metrics);
    } catch (error) {
      console.error('Erro ao buscar estatísticas do dashboard:', error);
      res.status(500).json({ error: 'Erro ao buscar estatísticas do dashboard' });
    }
  }

  static async getChartData(req: Request, res: Response) {
    try {
      const imobiliariaId = (req as any).user.imobiliariaId;
      if (!imobiliariaId) return res.status(403).json({ error: 'Imobiliária não vinculada' });
      const charts = await DashboardService.getChartData(imobiliariaId);
      res.json(charts);
    } catch (error) {
      console.error('Erro ao buscar dados de gráficos do dashboard:', error);
      res.status(500).json({ error: 'Erro ao buscar dados de gráficos' });
    }
  }

  static async getFinancialSummary(req: Request, res: Response) {
    try {
      const imobiliariaId = (req as any).user.imobiliariaId;
      if (!imobiliariaId) return res.status(403).json({ error: 'Imobiliária não vinculada' });
      const summary = await DashboardService.getFinancialSummary(imobiliariaId);
      res.json(summary);
    } catch (error) {
      console.error('Erro ao buscar resumo financeiro:', error);
      res.status(500).json({ error: 'Erro ao buscar resumo financeiro' });
    }
  }

  static async getFinancialEvolution(req: Request, res: Response) {
    try {
      const imobiliariaId = (req as any).user.imobiliariaId;
      if (!imobiliariaId) return res.status(403).json({ error: 'Imobiliária não vinculada' });
      const evolution = await DashboardService.getFinancialEvolution(imobiliariaId);
      res.json(evolution);
    } catch (error) {
      console.error('Erro ao buscar evolução financeira:', error);
      res.status(500).json({ error: 'Erro ao buscar evolução financeira' });
    }
  }

  static async getOperationalAlerts(req: Request, res: Response) {
    try {
      const imobiliariaId = (req as any).user.imobiliariaId;
      if (!imobiliariaId) return res.status(403).json({ error: 'Imobiliária não vinculada' });
      const alerts = await DashboardService.getOperationalAlerts(imobiliariaId);
      res.json(alerts);
    } catch (error) {
      console.error('Erro ao buscar alertas operacionais:', error);
      res.status(500).json({ error: 'Erro ao buscar alertas operacionais' });
    }
  }
}
