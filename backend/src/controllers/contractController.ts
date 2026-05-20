import { Request, Response } from 'express';
import { ContractService } from '../services/contractService';
import { createContractSchema } from '../validators/schemas';

export class ContractController {
  static async create(req: Request, res: Response) {
    try {
      const parsed = createContractSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ errors: parsed.error.flatten().fieldErrors });
      }

      const result = await ContractService.create(parsed.data);
      return res.status(201).json(result);
    } catch (error: any) {
      console.error('Erro ao criar contrato:', error);
      return res.status(400).json({ message: error.message || 'Erro interno do servidor' });
    }
  }

  static async list(req: Request, res: Response) {
    try {
      const { busca, status, page, limit } = req.query;
      const filters = {
        busca: busca as string,
        status: status as any,
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 20
      };

      const result = await ContractService.list(filters);
      return res.json(result);
    } catch (error) {
      console.error('Erro ao listar contratos:', error);
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const contract = await ContractService.getById(id);

      if (!contract) {
        return res.status(404).json({ message: 'Contrato não encontrado' });
      }

      return res.json(contract);
    } catch (error) {
      console.error('Erro ao buscar contrato:', error);
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }

  static async applyAdjustment(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await ContractService.applyAdjustment(id, req.body);
      return res.json(result);
    } catch (error: any) {
      console.error('Erro ao aplicar reajuste:', error);
      return res.status(400).json({ message: error.message || 'Erro interno do servidor' });
    }
  }
}
