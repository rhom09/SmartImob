import { Router } from 'express';
import prisma from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Listar alertas ativos
router.get('/', authMiddleware, async (req: any, res) => {
  try {
    const imobiliariaId = req.user?.imobiliariaId;
    if (!imobiliariaId) return res.status(403).json({ error: 'Sem imobiliária associada' });

    const alerts = await prisma.alert.findMany({
      where: {
        status: 'ATIVO',
        imobiliariaId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        contrato: {
          include: {
            inquilino: { select: { nome: true } },
            imovel: { select: { endereco: true } }
          }
        }
      }
    });

    res.json(alerts);
  } catch (error) {
    console.error('Erro ao listar notificações:', error);
    res.status(500).json({ error: 'Erro interno ao carregar notificações' });
  }
});

// Marcar alerta como lido
router.patch('/:id/read', authMiddleware, async (req: any, res) => {
  const id = req.params.id as string;
  const imobiliariaId = req.user?.imobiliariaId;
  if (!imobiliariaId) return res.status(403).json({ error: 'Sem imobiliária associada' });

  try {
    const result = await prisma.alert.updateMany({
      where: { id, imobiliariaId },
      data: { status: 'LIDO' }
    });

    if (result.count === 0) return res.status(404).json({ error: 'Alerta não encontrado' });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar notificação' });
  }
});

// Endpoint de diagnóstico para forçar verificação de vencimentos
router.post('/run-check', authMiddleware, async (req: any, res) => {
  try {
    const imobiliariaId = req.user?.imobiliariaId;
    if (!imobiliariaId) return res.status(403).json({ error: 'Sem imobiliária associada' });

    const { NotificationService } = require('../services/notificationService');
    await NotificationService.checkContractExpirations(imobiliariaId);

    // Retorna um resumo para o frontend saber o que aconteceu
    const count = await prisma.alert.count({ where: { status: 'ATIVO', imobiliariaId } });
    res.json({
      message: 'Verificação concluída com sucesso',
      activeAlertsCount: count
    });
  } catch (error) {
    console.error('Erro ao forçar verificação:', error);
    res.status(500).json({ error: 'Falha ao processar alertas' });
  }
});

// Endpoint temporário para cadastrar a Angélica como segunda gestora no Supabase
router.post('/seed-angelica', authMiddleware, async (req, res) => {
  try {
    const email = 'anglica.viana92@gmail.com';

    const user = await prisma.user.upsert({
      where: { email },
      update: { perfil: 'MANAGER', status: 'ATIVO' },
      create: {
        email,
        nome: 'Angélica Admin',
        supabaseId: 'mock-admin-id-2',
        perfil: 'MANAGER',
        status: 'ATIVO'
      }
    });

    await prisma.notificationPreference.upsert({
      where: { usuarioId_tipoAlerta: { usuarioId: user.id, tipoAlerta: 'VENCIMENTO' } },
      update: { emailEnabled: true },
      create: { usuarioId: user.id, tipoAlerta: 'VENCIMENTO', emailEnabled: true }
    });

    res.json({ message: 'Angélica cadastrada com sucesso!', userId: user.id });
  } catch (error) {
    console.error('Erro ao cadastrar Angélica:', error);
    res.status(500).json({ error: 'Falha no cadastro' });
  }
});

export default router;
