import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { PDFService } from '../services/pdfService';
import { authMiddleware as authenticate } from '../middleware/auth';

export class ReceiptController {
  static async listAll(req: Request, res: Response) {
    try {
      const imobiliariaId = (req as any).user.imobiliariaId;
      if (!imobiliariaId) return res.status(403).json({ error: 'Imobiliária não vinculada' });

      const { search, status, mes, ano } = req.query;

      const where: any = { imobiliariaId };

      if (status && status !== 'TODOS') {
        where.status = status;
      }

      if (mes) where.referenciaMes = Number(mes);
      if (ano) where.referenciaAno = Number(ano);

      if (search) {
        where.OR = [
          { numeroRecibo: { contains: String(search), mode: 'insensitive' } },
          { contrato: { inquilino: { nome: { contains: String(search), mode: 'insensitive' } } } },
          { contrato: { imovel: { endereco: { contains: String(search), mode: 'insensitive' } } } }
        ];
      }

      const receipts = await prisma.receipt.findMany({
        where,
        include: {
          contrato: {
            include: {
              inquilino: true,
              imovel: true
            }
          }
        },
        orderBy: { dataVencimento: 'desc' },
      });
      return res.json(receipts);
    } catch (error) {
      console.error('Erro ao listar recibos:', error);
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const imobiliariaId = (req as any).user.imobiliariaId;
      if (!imobiliariaId) return res.status(403).json({ error: 'Imobiliária não vinculada' });

      const {
        contratoId,
        referenciaMes,
        referenciaAno,
        valorBruto,
        descontos,
        valorLiquido,
        dataVencimento,
        observacoes,
        valorIptu,
        valorCondominio,
        valorAgua,
        valorLuz,
        outrosDebitos,
        formaPagamento
      } = req.body;

      const contrato = await prisma.contract.findFirst({
        where: { id: contratoId, imobiliariaId },
        include: { imovel: { include: { owner: true } } }
      });

      if (!contrato) return res.status(404).json({ message: 'Contrato não encontrado' });

      const existing = await prisma.receipt.findFirst({
        where: {
          contratoId,
          referenciaMes: Number(referenciaMes),
          referenciaAno: Number(referenciaAno),
          status: { not: 'CANCELADO' },
          imobiliariaId
        }
      });

      if (existing) {
        return res.status(400).json({ message: 'Já existe um recibo ativo para este contrato e período.' });
      }

      const receipt = await prisma.receipt.create({
        data: {
          contratoId,
          imobiliariaId,
          referenciaMes: Number(referenciaMes),
          referenciaAno: Number(referenciaAno),
          valorBruto: Number(valorBruto),
          descontos: Number(descontos || 0),
          valorLiquido: Number(valorLiquido),
          dataVencimento: new Date(dataVencimento),
          numeroRecibo: `REC-${Date.now().toString().slice(-6)}`,
          observacoes,
          valorIptu: Number(valorIptu || 0),
          valorCondominio: Number(valorCondominio || 0),
          valorAgua: Number(valorAgua || 0),
          valorLuz: Number(valorLuz || 0),
          outrosDebitos: Number(outrosDebitos || 0),
          formaPagamento: formaPagamento || contrato.imovel.owner.formaPagamento || 'Transferência Bancária'
        }
      });
      return res.status(201).json(receipt);
    } catch (error) {
      console.error('Erro ao criar recibo:', error);
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }

  static async cancel(req: Request, res: Response) {
    try {
      const imobiliariaId = (req as any).user.imobiliariaId;
      const { id } = req.params;
      const receipt = await prisma.receipt.updateMany({
        where: { id, imobiliariaId },
        data: { status: 'CANCELADO' }
      });
      if (receipt.count === 0) return res.status(404).json({ message: 'Recibo não encontrado' });
      return res.json({ message: 'Recibo cancelado' });
    } catch (error) {
      console.error('Erro ao cancelar recibo:', error);
      return res.status(500).json({ message: 'Erro interno do servidor ao cancelar' });
    }
  }

  static async pay(req: Request, res: Response) {
    try {
      const imobiliariaId = (req as any).user.imobiliariaId;
      const { id } = req.params;
      const { dataPagamento } = req.body;

      const receipt = await prisma.receipt.updateMany({
        where: { id, imobiliariaId },
        data: {
          status: 'PAGO',
          dataPagamento: dataPagamento ? new Date(dataPagamento) : new Date(),
        },
      });

      if (receipt.count === 0) return res.status(404).json({ message: 'Recibo não encontrado' });

      return res.json({ message: 'Recibo baixado' });
    } catch (error) {
      console.error('Erro ao dar baixa no recibo:', error);
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }

  static async listByContract(req: Request, res: Response) {
    try {
      const imobiliariaId = (req as any).user.imobiliariaId;
      const { contratoId } = req.params;
      const receipts = await prisma.receipt.findMany({
        where: { contratoId, imobiliariaId },
        orderBy: { dataVencimento: 'asc' },
      });
      return res.json(receipts);
    } catch (error) {
      console.error('Erro ao listar recibos:', error);
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }
}
