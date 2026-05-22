import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import {
  createPropertySchema,
  updatePropertySchema,
  propertyFiltersSchema,
} from '../validators/schemas';

const router = Router();

// ─── POST /api/imoveis ───────────────────────────────────────────────
router.post('/', async (req: Request, res: Response) => {
  try {
    const parsed = createPropertySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ errors: parsed.error.flatten().fieldErrors });
    }

    // Verificar se proprietário existe
    const owner = await prisma.owner.findUnique({
      where: { id: parsed.data.ownerId },
    });
    if (!owner) {
      return res.status(400).json({ message: 'Proprietário não encontrado' });
    }

    const property = await prisma.property.create({
      data: parsed.data,
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
router.get('/', async (req: Request, res: Response) => {
  try {
    const parsed = propertyFiltersSchema.safeParse(req.query);
    if (!parsed.success) {
      return res.status(400).json({ errors: parsed.error.flatten().fieldErrors });
    }

    const {
      tipo, finalidade, status, cidade, bairro,
      precoMin, precoMax, quartos, busca,
      page, limit, orderBy, order,
    } = parsed.data;

    const where: any = { deletedAt: null };

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
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (typeof id !== 'string') return res.status(400).json({ message: 'ID inválido' });

    const property = await prisma.property.findFirst({
      where: { id, deletedAt: null },
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
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (typeof id !== 'string') return res.status(400).json({ message: 'ID inválido' });

    const parsed = updatePropertySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ errors: parsed.error.flatten().fieldErrors });
    }

    // Check if property exists and is not deleted
    const existing = await prisma.property.findFirst({
      where: { id, deletedAt: null },
    });
    if (!existing) {
      return res.status(404).json({ message: 'Imóvel não encontrado' });
    }

    // If changing owner, verify new owner exists
    if (parsed.data.ownerId) {
      const ownerId = parsed.data.ownerId;
      const owner = await prisma.owner.findUnique({
        where: { id: ownerId },
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
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (typeof id !== 'string') return res.status(400).json({ message: 'ID inválido' });

    const existing = await prisma.property.findFirst({
      where: { id, deletedAt: null },
    });
    if (!existing) {
      return res.status(404).json({ message: 'Imóvel não encontrado' });
    }

    // Check for active contracts
    const activeContracts = await prisma.contract.count({
      where: { imovelId: id, status: 'ATIVO' },
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

router.get('/:id/defaults', async (req: Request, res: Response) => {
  try {
    const id = typeof req.params.id === 'string' ? req.params.id : (req.params.id ? req.params.id[0] : '');
    if (!id) return res.status(400).json({ message: 'ID inválido' });

    const property = await prisma.property.findUnique({
      where: { id },
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

export default router;
