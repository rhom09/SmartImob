import { Router } from 'express';
import prisma from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Listar alertas ativos
router.get('/', authMiddleware, async (req: any, res) => {
  try {
    const alerts = await prisma.alert.findMany({
      where: {
        status: 'ATIVO',
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
router.patch('/:id/read', authMiddleware, async (req, res) => {
  const id = req.params.id as string;
  try {
    await prisma.alert.update({
      where: { id },
      data: { status: 'LIDO' }
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar notificação' });
  }
});

// Endpoint de diagnóstico para forçar verificação de vencimentos
router.post('/run-check', authMiddleware, async (req, res) => {
  try {
    const { NotificationService } = require('../services/notificationService');
    await NotificationService.checkContractExpirations();

    // Retorna um resumo para o frontend saber o que aconteceu
    const count = await prisma.alert.count({ where: { status: 'ATIVO' } });
    res.json({
      message: 'Verificação concluída com sucesso',
      activeAlertsCount: count
    });
  } catch (error) {
    console.error('Erro ao forçar verificação:', error);
    res.status(500).json({ error: 'Falha ao processar alertas' });
  }
});

export default router;
