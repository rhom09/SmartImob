import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { PDFService } from '../services/pdfService';

const generateReceiptNumber = () => Math.random().toString(36).substring(2, 8).toUpperCase();

export class ReceiptController {
  static async listAll(req: Request, res: Response) {
    try {
      const { search, status, mes, ano } = req.query;

      const where: any = {};

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

      // Validação de duplicidade: Evitar gerar dois recibos para o mesmo mês/ano/contrato
      const existing = await prisma.receipt.findFirst({
        where: {
          contratoId,
          referenciaMes: Number(referenciaMes),
          referenciaAno: Number(referenciaAno),
          status: { not: 'CANCELADO' }
        }
      });

      if (existing) {
        return res.status(400).json({ message: 'Já existe um recibo ativo para este contrato e período.' });
      }

      const receipt = await prisma.receipt.create({
        data: {
          contratoId,
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
          formaPagamento: formaPagamento || 'Transferência Bancária'
        }
      });
      return res.status(201).json(receipt);
    } catch (error) {
      console.error('Erro ao criar recibo:', error);
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }

  static async preview(req: Request, res: Response) {
    try {
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

      const contrato = await prisma.contract.findUnique({
        where: { id: contratoId },
        include: {
          inquilino: true,
          imovel: {
            include: {
              owner: true
            }
          }
        }
      });

      if (!contrato) {
        return res.status(404).json({ message: 'Contrato não encontrado' });
      }

      console.log('Dados do contrato carregados:', JSON.stringify(contrato, null, 2));
      console.log('Imóvel:', contrato.imovel);
      console.log('Proprietário (Owner):', contrato.imovel?.owner);

      // Mock de um objeto Receipt para o PDFService
      const mockReceipt: any = {
        numeroRecibo: 'PREVIEW',
        contrato,
        referenciaMes: Number(referenciaMes),
        referenciaAno: Number(referenciaAno),
        valorBruto: Number(valorBruto),
        descontos: Number(descontos || 0),
        valorLiquido: Number(valorLiquido),
        dataVencimento: new Date(dataVencimento),
        observacoes,
        valorIptu: Number(valorIptu || 0),
        valorCondominio: Number(valorCondominio || 0),
        valorAgua: Number(valorAgua || 0),
        valorLuz: Number(valorLuz || 0),
        outrosDebitos: Number(outrosDebitos || 0),
        formaPagamento: formaPagamento || 'Transferência Bancária',
        status: 'PENDENTE',
        createdAt: new Date()
      };

      const pdfBuffer = req.query.layout === 'simple'
        ? await PDFService.generateSimpleReceiptPDF(mockReceipt)
        : await PDFService.generateReceiptPDF(mockReceipt);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline; filename=preview-recibo.pdf');
      return res.send(pdfBuffer);
    } catch (error) {
      console.error('Erro ao gerar prévia:', error);
      return res.status(500).json({ message: 'Erro ao gerar prévia do documento' });
    }
  }

  static async cancel(req: Request, res: Response) {
    try {
      const id = typeof req.params.id === 'string' ? req.params.id : '';
      const receipt = await prisma.receipt.update({
        where: { id },
        data: { status: 'CANCELADO' }
      });
      return res.json(receipt);
    } catch (error: any) {
      console.error('Erro ao cancelar recibo:', error);
      if (error.code === 'P2025') {
        return res.status(404).json({ message: 'Recibo não encontrado' });
      }
      return res.status(500).json({ message: 'Erro interno do servidor ao cancelar' });
    }
  }

  static async downloadPDF(req: Request, res: Response) {
    try {
      const id = typeof req.params.id === 'string' ? req.params.id : '';
      const receipt = await prisma.receipt.findUnique({
        where: { id },
        include: {
          contrato: {
            include: {
              inquilino: true,
              imovel: {
                include: {
                  owner: true
                }
              }
            }
          }
        }
      });

      if (!receipt) {
        return res.status(404).json({ message: 'Recibo não encontrado' });
      }

      const pdfBuffer = req.query.layout === 'simple'
        ? await PDFService.generateSimpleReceiptPDF(receipt)
        : await PDFService.generateReceiptPDF(receipt);

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
      const id = typeof req.params.id === 'string' ? req.params.id : '';
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
      const contratoId = typeof req.params.contratoId === 'string' ? req.params.contratoId : '';
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
