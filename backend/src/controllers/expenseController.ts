import { Request, Response } from 'express';
import { ExpenseService } from '../services/expenseService';

export class ExpenseController {
  static async create(req: Request, res: Response) {
    try {
      const imobiliariaId = (req as any).user.imobiliariaId;
      if (!imobiliariaId) return res.status(403).json({ error: 'Imobiliária não vinculada' });

      const expense = await ExpenseService.create({ ...req.body, imobiliariaId });
      return res.status(201).json(expense);
    } catch (error: any) {
      console.error('Erro ao criar despesa:', error);
      return res.status(400).json({ message: error.message || 'Erro interno do servidor' });
    }
  }

  static async list(req: Request, res: Response) {
    try {
      const imobiliariaId = (req as any).user.imobiliariaId;
      if (!imobiliariaId) return res.status(403).json({ error: 'Imobiliária não vinculada' });

      const { contratoId, tipo, status, dataInicio, dataFim, page, limit } = req.query;
      const filters = {
        contratoId: typeof contratoId === 'string' ? contratoId : undefined,
        tipo: typeof tipo === 'string' ? tipo : undefined,
        status: typeof status === 'string' ? status : undefined,
        dataInicio: typeof dataInicio === 'string' ? dataInicio : undefined,
        dataFim: typeof dataFim === 'string' ? dataFim : undefined,
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 20,
      };

      const result = await ExpenseService.list(filters, imobiliariaId);
      return res.json(result);
    } catch (error) {
      console.error('Erro ao listar despesas:', error);
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const imobiliariaId = (req as any).user.imobiliariaId;
      const id = typeof req.params.id === 'string' ? req.params.id : '';
      const expense = await ExpenseService.getById(id, imobiliariaId);

      if (!expense) {
        return res.status(404).json({ message: 'Despesa não encontrada' });
      }

      return res.json(expense);
    } catch (error) {
      console.error('Erro ao buscar despesa:', error);
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const imobiliariaId = (req as any).user.imobiliariaId;
      const id = typeof req.params.id === 'string' ? req.params.id : '';
      const expense = await ExpenseService.update(id, req.body, imobiliariaId);
      return res.json(expense);
    } catch (error: any) {
      console.error('Erro ao atualizar despesa:', error);
      return res.status(400).json({ message: error.message || 'Erro interno do servidor' });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const imobiliariaId = (req as any).user.imobiliariaId;
      const id = typeof req.params.id === 'string' ? req.params.id : '';
      await ExpenseService.delete(id, imobiliariaId);
      return res.json({ message: 'Despesa excluída com sucesso' });
    } catch (error: any) {
      console.error('Erro ao excluir despesa:', error);
      return res.status(400).json({ message: error.message || 'Erro interno do servidor' });
    }
  }

  static async markAsPaid(req: Request, res: Response) {
    try {
      const imobiliariaId = (req as any).user.imobiliariaId;
      const id = typeof req.params.id === 'string' ? req.params.id : '';
      const { dataPagamento } = req.body;
      const expense = await ExpenseService.markAsPaid(id, dataPagamento, imobiliariaId);
      return res.json(expense);
    } catch (error: any) {
      console.error('Erro ao dar baixa na despesa:', error);
      return res.status(400).json({ message: error.message || 'Erro interno do servidor' });
    }
  }
}
