import { Request, Response } from 'express';
import { FinancialService } from '../services/financialService';

export class FinancialController {
  // ─── Contratos Inadimplentes ──────────────────────────────────────
  static async getInadimplentes(req: Request, res: Response) {
    try {
      const imobiliariaId = (req as any).user?.imobiliariaId;
      if (!imobiliariaId) return res.status(403).json({ error: 'Sem imobiliária associada' });

      const result = await FinancialService.getInadimplentes(imobiliariaId);
      return res.json(result);
    } catch (error) {
      console.error('Erro ao buscar inadimplentes:', error);
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }

  // ─── Comissões ────────────────────────────────────────────────────
  static async getComissoes(req: Request, res: Response) {
    try {
      const imobiliariaId = (req as any).user?.imobiliariaId;
      if (!imobiliariaId) return res.status(403).json({ error: 'Sem imobiliária associada' });

      const { dataInicio, dataFim } = req.query;
      const result = await FinancialService.getComissoes(imobiliariaId, {
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
      const imobiliariaId = (req as any).user?.imobiliariaId;
      if (!imobiliariaId) return res.status(403).json({ error: 'Sem imobiliária associada' });

      const { dataInicio, dataFim } = req.query;
      const result = await FinancialService.getRepasses(imobiliariaId, {
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
      const imobiliariaId = (req as any).user?.imobiliariaId;
      if (!imobiliariaId) return res.status(403).json({ error: 'Sem imobiliária associada' });

      const { dataInicio, dataFim } = req.query;

      if (!dataInicio || !dataFim) {
        return res.status(400).json({ message: 'Parâmetros dataInicio e dataFim são obrigatórios' });
      }

      const result = await FinancialService.getFluxoCaixa(imobiliariaId, {
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
      const imobiliariaId = (req as any).user?.imobiliariaId;
      if (!imobiliariaId) return res.status(403).json({ error: 'Sem imobiliária associada' });

      const { dataInicio, dataFim } = req.query;
      const result = await FinancialService.getResumo(imobiliariaId, {
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
