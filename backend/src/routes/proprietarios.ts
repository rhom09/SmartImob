import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { authMiddleware as authenticate } from '../middleware/auth';
import { createOwnerSchema, updateOwnerSchema } from '../validators/schemas';

const router = Router();

// ─── POST /api/proprietarios ─────────────────────────────────────────
router.post('/', authenticate, async (req: Request, res: Response) => {
  try {
    const imobiliariaId = (req as any).user.imobiliariaId;
    if (!imobiliariaId) return res.status(403).json({ error: 'Imobiliária não vinculada' });

    const parsed = createOwnerSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ errors: parsed.error.flatten().fieldErrors });
    }

    const existing = await prisma.owner.findFirst({
      where: { cpfCnpj: parsed.data.cpfCnpj.replace(/\D/g, ''), imobiliariaId },
    });
    if (existing) {
      return res.status(409).json({ message: 'CPF/CNPJ já cadastrado para esta imobiliária' });
    }

    const owner = await prisma.owner.create({
      data: {
        ...parsed.data,
        cpfCnpj: parsed.data.cpfCnpj.replace(/\D/g, ''),
        imobiliariaId,
      },
    });

    return res.status(201).json(owner);
  } catch (error) {
    console.error('Erro ao criar proprietário:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// ─── GET /api/proprietarios ──────────────────────────────────────────
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const imobiliariaId = (req as any).user.imobiliariaId;
    if (!imobiliariaId) return res.status(403).json({ error: 'Imobiliária não vinculada' });

    const { busca, page = '1', limit = '20' } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = { status: 'ATIVO', imobiliariaId };
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
router.get('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const imobiliariaId = (req as any).user.imobiliariaId;
    const { id } = req.params; console.log("🔍 [DEBUG] Buscando proprietário:", id, "na Imobiliária:", (req as any).user.imobiliariaId);
    if (typeof id !== 'string') return res.status(400).json({ message: 'ID inválido' });

    const owner = await prisma.owner.findFirst({
      where: { id, imobiliariaId },
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
router.put('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const imobiliariaId = (req as any).user.imobiliariaId;
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

    const owner = await prisma.owner.updateMany({
      where: { id, imobiliariaId },
      data,
    });

    if (owner.count === 0) return res.status(404).json({ message: 'Proprietário não encontrado' });

    return res.json({ message: 'Proprietário atualizado com sucesso' });
  } catch (error: any) {
    console.error('Erro ao atualizar proprietário:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// ─── DELETE /api/proprietarios/:id (soft delete) ─────────────────────
router.delete('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const imobiliariaId = (req as any).user.imobiliariaId;
    const { id } = req.params;
    if (typeof id !== 'string') return res.status(400).json({ message: 'ID inválido' });

    const owner = await prisma.owner.updateMany({
      where: { id, imobiliariaId },
      data: { status: 'INATIVO' },
    });

    if (owner.count === 0) return res.status(404).json({ message: 'Proprietário não encontrado' });

    return res.json({ message: 'Proprietário desativado com sucesso' });
  } catch (error: any) {
    console.error('Erro ao desativar proprietário:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

export default router;
