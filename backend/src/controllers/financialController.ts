import { Request, Response } from 'express';
import { FinancialService } from '../services/financialService';

export class FinancialController {
  // ─── Contratos Inadimplentes ──────────────────────────────────────
  static async getInadimplentes(_req: Request, res: Response) {
    try {
      const result = await FinancialService.getInadimplentes();
      return res.json(result);
    } catch (error) {
      console.error('Erro ao buscar inadimplentes:', error);
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }

  // ─── Comissões ────────────────────────────────────────────────────
  static async getComissoes(req: Request, res: Response) {
    try {
      const { dataInicio, dataFim } = req.query;
      const result = await FinancialService.getComissoes({
        dataInicio: typeof dataInicio === 'string' ? dataInicio : undefined,
        dataFim: typeof dataFim === 'string' ? dataFim : undefined,
      });
      return res.json(result);
    } catch (error) {
      console.error('Erro ao buscar comissões:', error);
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }

  // ─── Repasses ─────────────────────────────────────────────────────
  static async getRepasses(req: Request, res: Response) {
    try {
      const { dataInicio, dataFim } = req.query;
      const result = await FinancialService.getRepasses({
        dataInicio: typeof dataInicio === 'string' ? dataInicio : undefined,
        dataFim: typeof dataFim === 'string' ? dataFim : undefined,
      });
      return res.json(result);
    } catch (error) {
      console.error('Erro ao buscar repasses:', error);
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }

  // ─── Fluxo de Caixa ──────────────────────────────────────────────
  static async getFluxoCaixa(req: Request, res: Response) {
    try {
      const { dataInicio, dataFim } = req.query;

      if (!dataInicio || !dataFim) {
        return res.status(400).json({ message: 'Parâmetros dataInicio e dataFim são obrigatórios' });
      }

      const result = await FinancialService.getFluxoCaixa({
        dataInicio: dataInicio as string,
        dataFim: dataFim as string,
      });
      return res.json(result);
    } catch (error) {
      console.error('Erro ao buscar fluxo de caixa:', error);
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }

  // ─── Resumo Financeiro ────────────────────────────────────────────
  static async getResumo(req: Request, res: Response) {
    try {
      const { dataInicio, dataFim } = req.query;
      const result = await FinancialService.getResumo({
        dataInicio: typeof dataInicio === 'string' ? dataInicio : undefined,
        dataFim: typeof dataFim === 'string' ? dataFim : undefined,
      });
      return res.json(result);
    } catch (error) {
      console.error('Erro ao buscar resumo financeiro:', error);
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }
}
