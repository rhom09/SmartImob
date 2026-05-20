import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { PDFService } from '../services/pdfService';

export class ReceiptController {
  static async downloadPDF(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const receipt = await prisma.receipt.findUnique({
        where: { id },
        include: {
          contrato: {
            include: {
              inquilino: true,
              imovel: true
            }
          }
        }
      });

      if (!receipt) {
        return res.status(404).json({ message: 'Recibo não encontrado' });
      }

      const pdfBuffer = await PDFService.generateReceiptPDF(receipt);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=recibo-${receipt.numeroRecibo}.pdf`);
      return res.send(pdfBuffer);
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      return res.status(500).json({ message: 'Erro ao gerar documento' });
    }
  }

  static async pay(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { dataPagamento } = req.body;

      const receipt = await prisma.receipt.update({
        where: { id },
        data: {
          status: 'PAGO',
          dataPagamento: dataPagamento ? new Date(dataPagamento) : new Date(),
        },
      });

      return res.json(receipt);
    } catch (error: any) {
      console.error('Erro ao dar baixa no recibo:', error);
      if (error.code === 'P2025') {
        return res.status(404).json({ message: 'Recibo não encontrado' });
      }
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }

  static async listByContract(req: Request, res: Response) {
    try {
      const { contratoId } = req.params;
      const receipts = await prisma.receipt.findMany({
        where: { contratoId },
        orderBy: { dataVencimento: 'asc' },
      });
      return res.json(receipts);
    } catch (error) {
      console.error('Erro ao listar recibos:', error);
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }
}
