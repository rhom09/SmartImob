import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { authMiddleware as authenticate } from '../middleware/auth';
import {
  createPropertySchema,
  updatePropertySchema,
  propertyFiltersSchema,
} from '../validators/schemas';

const router = Router();

// ─── POST /api/imoveis ───────────────────────────────────────────────
router.post('/', authenticate, async (req: Request, res: Response) => {
  try {
    const imobiliariaId = (req as any).user.imobiliariaId;
    if (!imobiliariaId) return res.status(403).json({ error: 'Imobiliária não vinculada' });

    const parsed = createPropertySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ errors: parsed.error.flatten().fieldErrors });
    }

    // Verificar se proprietário existe e pertence à mesma imobiliária
    const owner = await prisma.owner.findUnique({
      where: { id: parsed.data.ownerId, imobiliariaId },
    });
    if (!owner) {
      return res.status(400).json({ message: 'Proprietário não encontrado' });
    }

    const property = await prisma.property.create({
      data: { ...parsed.data, imobiliariaId },
      include: { owner: true },
    });

    return res.status(201).json(property);
  } catch (error: any) {
    if (error.code === 'P2002' && error.meta?.target?.includes('codigo')) {
      return res.status(409).json({ message: 'Código do imóvel já cadastrado' });
    }
    console.error('Erro ao criar imóvel:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// ─── GET /api/imoveis ────────────────────────────────────────────────
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const imobiliariaId = (req as any).user.imobiliariaId;
    const parsed = propertyFiltersSchema.safeParse(req.query);
    if (!parsed.success) {
      return res.status(400).json({ errors: parsed.error.flatten().fieldErrors });
    }

    const {
      tipo, finalidade, status, cidade, bairro,
      precoMin, precoMax, quartos, busca,
      page, limit, orderBy, order,
    } = parsed.data;

    const where: any = { deletedAt: null, imobiliariaId };

    if (tipo) where.tipo = tipo;
    if (finalidade) where.finalidade = finalidade;
    if (status) where.status = status;
    if (cidade) where.cidade = { contains: cidade, mode: 'insensitive' };
    if (bairro) where.bairro = { contains: bairro, mode: 'insensitive' };
    if (quartos) where.quartos = { gte: quartos };

    if (precoMin || precoMax) {
      where.OR = [];
      if (precoMin) {
        where.OR.push(
          { valorVenda: { gte: precoMin } },
          { valorLocacao: { gte: precoMin } }
        );
      }
      // For max, we rebuild OR to handle both price fields
      if (precoMax && !precoMin) {
        where.OR.push(
          { valorVenda: { lte: precoMax } },
          { valorLocacao: { lte: precoMax } }
        );
      }
    }

    if (busca) {
      where.AND = [
        ...(where.AND || []),
        {
          OR: [
            { endereco: { contains: busca, mode: 'insensitive' } },
            { bairro: { contains: busca, mode: 'insensitive' } },
            { cidade: { contains: busca, mode: 'insensitive' } },
            { codigo: { contains: busca, mode: 'insensitive' } },
            { descricao: { contains: busca, mode: 'insensitive' } },
          ],
        },
      ];
    }

    const skip = (page - 1) * limit;

    const [properties, total] = await Promise.all([
      prisma.property.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [orderBy]: order },
        include: {
          owner: { select: { id: true, nome: true, cpfCnpj: true, telefone: true } },
          fotos: { orderBy: { order: 'asc' }, take: 1, where: { isCover: true } },
          _count: { select: { fotos: true, contratos: true } },
        },
      }),
      prisma.property.count({ where }),
    ]);

    return res.json({
      data: properties,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Erro ao listar imóveis:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// ─── GET /api/imoveis/:id ────────────────────────────────────────────
router.get('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const imobiliariaId = (req as any).user.imobiliariaId;
    const { id } = req.params;
    if (typeof id !== 'string') return res.status(400).json({ message: 'ID inválido' });

    const property = await prisma.property.findFirst({
      where: { id, deletedAt: null, imobiliariaId },
      include: {
        owner: true,
        fotos: { orderBy: { order: 'asc' } },
        contratos: {
          orderBy: { createdAt: 'desc' },
          take: 5,
          include: {
            inquilino: { select: { id: true, nome: true } },
          },
        },
      },
    });

    if (!property) {
      return res.status(404).json({ message: 'Imóvel não encontrado' });
    }

    return res.json(property);
  } catch (error) {
    console.error('Erro ao buscar imóvel:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// ─── PUT /api/imoveis/:id ────────────────────────────────────────────
router.put('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const imobiliariaId = (req as any).user.imobiliariaId;
    const { id } = req.params;
    if (typeof id !== 'string') return res.status(400).json({ message: 'ID inválido' });

    const parsed = updatePropertySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ errors: parsed.error.flatten().fieldErrors });
    }

    const existing = await prisma.property.findFirst({
      where: { id, deletedAt: null, imobiliariaId },
    });
    if (!existing) {
      return res.status(404).json({ message: 'Imóvel não encontrado' });
    }

    if (parsed.data.ownerId) {
      const owner = await prisma.owner.findUnique({
        where: { id: parsed.data.ownerId, imobiliariaId },
      });
      if (!owner) {
        return res.status(400).json({ message: 'Proprietário não encontrado' });
      }
    }

    const property = await prisma.property.update({
      where: { id },
      data: parsed.data,
      include: { owner: true },
    });
    console.log("Property updated successfully:", property);

    return res.json(property);
  } catch (error: any) {
    if (error.code === 'P2002' && error.meta?.target?.includes('codigo')) {
      return res.status(409).json({ message: 'Código do imóvel já cadastrado' });
    }
    console.error('Erro ao atualizar imóvel:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// ─── DELETE /api/imoveis/:id (soft delete) ───────────────────────────
router.delete('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const imobiliariaId = (req as any).user.imobiliariaId;
    const { id } = req.params;
    if (typeof id !== 'string') return res.status(400).json({ message: 'ID inválido' });

    const existing = await prisma.property.findFirst({
      where: { id, deletedAt: null, imobiliariaId },
    });
    if (!existing) {
      return res.status(404).json({ message: 'Imóvel não encontrado' });
    }

    const activeContracts = await prisma.contract.count({
      where: { imovelId: id, status: 'ATIVO', imobiliariaId },
    });
    if (activeContracts > 0) {
      return res.status(400).json({
        message: 'Não é possível excluir imóvel com contratos ativos',
      });
    }

    const property = await prisma.property.update({
      where: { id },
      data: { deletedAt: new Date(), status: 'SUSPENSO' },
    });

    return res.json({ message: 'Imóvel excluído com sucesso', property });
  } catch (error) {
    console.error('Erro ao excluir imóvel:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

router.get('/:id/defaults', authenticate, async (req: Request, res: Response) => {
  try {
    const imobiliariaId = (req as any).user.imobiliariaId;
    const id = typeof req.params.id === 'string' ? req.params.id : (req.params.id ? (req.params.id as any)[0] : '');
    if (!id) return res.status(400).json({ message: 'ID inválido' });

    const property = await prisma.property.findUnique({
      where: { id, imobiliariaId },
      select: {
        valorCondominio: true,
        valorIptu: true,
        valorAgua: true,
        valorLuz: true,
        outrosDebitos: true,
        descontos: true,
      },
    });

    if (!property) return res.status(404).json({ message: 'Imóvel não encontrado' });

    return res.json(property);
  } catch (error) {
    console.error('Erro ao buscar valores padrão:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

router.get('/:id/owner', authenticate, async (req: Request, res: Response) => {
  try {
    const imobiliariaId = (req as any).user.imobiliariaId;
    const id = typeof req.params.id === 'string' ? req.params.id : '';
    if (!id) return res.status(400).json({ message: 'ID inválido' });

    const property = await prisma.property.findUnique({
      where: { id, imobiliariaId },
      include: { owner: true },
    });

    if (!property || !property.owner) return res.status(404).json({ message: 'Imóvel ou proprietário não encontrado' });

    return res.json(property.owner);
  } catch (error) {
    console.error('Erro ao buscar proprietário do imóvel:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

export default router;
