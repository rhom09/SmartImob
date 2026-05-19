import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { createTenantSchema, updateTenantSchema, createInteractionSchema } from '../validators/schemas';

const router = Router();

// ─── POST /api/clientes ──────────────────────────────────────────────
router.post('/', async (req: Request, res: Response) => {
  try {
    const parsed = createTenantSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ errors: parsed.error.flatten().fieldErrors });
    }

    const existing = await prisma.tenant.findUnique({
      where: { cpfCnpj: parsed.data.cpfCnpj.replace(/\D/g, '') },
    });
    if (existing) {
      return res.status(409).json({ message: 'CPF/CNPJ já cadastrado' });
    }

    const tenant = await prisma.tenant.create({
      data: {
        ...parsed.data,
        cpfCnpj: parsed.data.cpfCnpj.replace(/\D/g, ''),
      },
    });

    return res.status(201).json(tenant);
  } catch (error) {
    console.error('Erro ao criar cliente:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// ─── GET /api/clientes ───────────────────────────────────────────────
router.get('/', async (req: Request, res: Response) => {
  try {
    const { busca, tipo, page = '1', limit = '20' } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = { status: 'ATIVO' };

    if (tipo) {
      where.tipo = tipo;
    }

    if (busca) {
      where.OR = [
        { nome: { contains: String(busca), mode: 'insensitive' } },
        { cpfCnpj: { contains: String(busca).replace(/\D/g, '') } },
        { email: { contains: String(busca), mode: 'insensitive' } },
      ];
    }

    const [tenants, total] = await Promise.all([
      prisma.tenant.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        include: { _count: { select: { contratos: true, interacoes: true } } },
      }),
      prisma.tenant.count({ where }),
    ]);

    return res.json({
      data: tenants,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error('Erro ao listar clientes:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// ─── GET /api/clientes/:id ───────────────────────────────────────────
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (typeof id !== 'string') return res.status(400).json({ message: 'ID inválido' });

    const tenant = await prisma.tenant.findUnique({
      where: { id },
      include: {
        contratos: {
          orderBy: { createdAt: 'desc' },
          include: { imovel: true }
        },
      },
    });

    if (!tenant) {
      return res.status(404).json({ message: 'Cliente não encontrado' });
    }

    return res.json(tenant);
  } catch (error) {
    console.error('Erro ao buscar cliente:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// ─── PUT /api/clientes/:id ───────────────────────────────────────────
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (typeof id !== 'string') return res.status(400).json({ message: 'ID inválido' });

    const parsed = updateTenantSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ errors: parsed.error.flatten().fieldErrors });
    }

    const data = { ...parsed.data };
    if (data.cpfCnpj) {
      data.cpfCnpj = data.cpfCnpj.replace(/\D/g, '');
    }

    const tenant = await prisma.tenant.update({
      where: { id },
      data,
    });

    return res.json(tenant);
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Cliente não encontrado' });
    }
    console.error('Erro ao atualizar cliente:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// ─── DELETE /api/clientes/:id (soft delete) ──────────────────────────
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (typeof id !== 'string') return res.status(400).json({ message: 'ID inválido' });

    // Validate if client has active contracts before deleting
    const activeContracts = await prisma.contract.count({
      where: { inquilinoId: id, status: 'ATIVO' },
    });

    if (activeContracts > 0) {
      return res.status(400).json({
        message: 'Não é possível desativar cliente com contratos ativos'
      });
    }

    const tenant = await prisma.tenant.update({
      where: { id },
      data: { status: 'INATIVO' },
    });

    return res.json({ message: 'Cliente desativado com sucesso', tenant });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Cliente não encontrado' });
    }
    console.error('Erro ao desativar cliente:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// ─── POST /api/clientes/:id/interacoes ───────────────────────────────
router.post('/:id/interacoes', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (typeof id !== 'string') return res.status(400).json({ message: 'ID inválido' });

    const parsed = createInteractionSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ errors: parsed.error.flatten().fieldErrors });
    }

    const tenant = await prisma.tenant.findUnique({ where: { id } });
    if (!tenant) {
      return res.status(404).json({ message: 'Cliente não encontrado' });
    }

    const interacao = await prisma.interaction.create({
      data: {
        tenantId: id,
        ...parsed.data
      },
    });

    return res.status(201).json(interacao);
  } catch (error) {
    console.error('Erro ao registrar interação:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// ─── GET /api/clientes/:id/interacoes ────────────────────────────────
router.get('/:id/interacoes', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (typeof id !== 'string') return res.status(400).json({ message: 'ID inválido' });

    const interacoes = await prisma.interaction.findMany({
      where: { tenantId: id },
      orderBy: { data: 'desc' },
      include: {
        usuario: { select: { id: true, nome: true } }
      }
    });

    return res.json(interacoes);
  } catch (error) {
    console.error('Erro ao listar interações:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

export default router;
