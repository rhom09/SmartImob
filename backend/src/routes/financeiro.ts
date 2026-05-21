import { Router } from 'express';
import { FinancialController } from '../controllers/financialController';

const router = Router();

router.get('/inadimplencia', FinancialController.getInadimplentes);
router.get('/comissoes', FinancialController.getComissoes);
router.get('/repasses', FinancialController.getRepasses);
router.get('/fluxo-caixa', FinancialController.getFluxoCaixa);
router.get('/resumo', FinancialController.getResumo);

export default router;
