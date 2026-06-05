import { Router } from 'express';
import { FinancialController } from '../controllers/financialController';
import { authMiddleware as authenticate } from '../middleware/auth';

const router = Router();

router.get('/inadimplencia', authenticate, FinancialController.getInadimplentes);
router.get('/comissoes', authenticate, FinancialController.getComissoes);
router.get('/repasses', authenticate, FinancialController.getRepasses);
router.get('/fluxo-caixa', authenticate, FinancialController.getFluxoCaixa);
router.get('/resumo', authenticate, FinancialController.getResumo);

export default router;
