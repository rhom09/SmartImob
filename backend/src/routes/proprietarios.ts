import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { createOwnerSchema, updateOwnerSchema } from '../validators/schemas';

const router = Router();

// ─── POST /api/proprietarios ─────────────────────────────────────────
router.post('/', async (req: Request, res: Response) => {
  try {
    const parsed = createOwnerSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ errors: parsed.error.flatten().fieldErrors });
    }

    const existing = await prisma.owner.findUnique({
      where: { cpfCnpj: parsed.data.cpfCnpj.replace(/\D/g, '') },
    });
    if (existing) {
      return res.status(409).json({ message: 'CPF/CNPJ já cadastrado' });
    }

    const owner = await prisma.owner.create({
      data: {
        ...parsed.data,
        cpfCnpj: parsed.data.cpfCnpj.replace(/\D/g, ''),
        formaPagamento: parsed.data.formaPagamento,
        chavePix: parsed.data.chavePix,
        banco: parsed.data.banco,
        agencia: parsed.data.agencia,
        conta: parsed.data.conta,
      },
    });

    return res.status(201).json(owner);
  } catch (error) {
    console.error('Erro ao criar proprietário:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// ─── GET /api/proprietarios ──────────────────────────────────────────
router.get('/', async (req: Request, res: Response) => {
  try {
    const { busca, page = '1', limit = '20' } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = { status: 'ATIVO' };
    if (busca) {
      where.OR = [
        { nome: { contains: String(busca), mode: 'insensitive' } },
        { cpfCnpj: { contains: String(busca).replace(/\D/g, '') } },
        { email: { contains: String(busca), mode: 'insensitive' } },
      ];
    }

    const [owners, total] = await Promise.all([
      prisma.owner.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        include: { _count: { select: { imoveis: true } } },
      }),
      prisma.owner.count({ where }),
    ]);

    return res.json({
      data: owners,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error('Erro ao listar proprietários:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// ─── GET /api/proprietarios/:id ──────────────────────────────────────
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (typeof id !== 'string') return res.status(400).json({ message: 'ID inválido' });

    const owner = await prisma.owner.findUnique({
      where: { id },
      include: {
        imoveis: {
          where: { deletedAt: null },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!owner) {
      return res.status(404).json({ message: 'Proprietário não encontrado' });
    }

    return res.json(owner);
  } catch (error) {
    console.error('Erro ao buscar proprietário:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// ─── PUT /api/proprietarios/:id ──────────────────────────────────────
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (typeof id !== 'string') return res.status(400).json({ message: 'ID inválido' });

    const parsed = updateOwnerSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ errors: parsed.error.flatten().fieldErrors });
    }

    const data = { ...parsed.data };
    if (data.cpfCnpj) {
      data.cpfCnpj = data.cpfCnpj.replace(/\D/g, '');
    }

    const owner = await prisma.owner.update({
      where: { id },
      data,
    });

    return res.json(owner);
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Proprietário não encontrado' });
    }
    console.error('Erro ao atualizar proprietário:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// ─── DELETE /api/proprietarios/:id (soft delete) ─────────────────────
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (typeof id !== 'string') return res.status(400).json({ message: 'ID inválido' });

    const owner = await prisma.owner.update({
      where: { id },
      data: { status: 'INATIVO' },
    });

    return res.json({ message: 'Proprietário desativado com sucesso', owner });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Proprietário não encontrado' });
    }
    console.error('Erro ao desativar proprietário:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

export default router;
