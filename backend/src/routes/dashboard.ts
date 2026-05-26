import { Router } from 'express';
import { DashboardController } from '../controllers/dashboardController';
import { authMiddleware as authenticate } from '../middleware/auth';

const router = Router();

// router.get('/stats', authenticate, DashboardController.getDashboardData);
// router.get('/chart-data', authenticate, DashboardController.getChartData);

router.get('/stats', DashboardController.getDashboardData);
router.get('/chart-data', DashboardController.getChartData);
router.get('/financial-summary', DashboardController.getFinancialSummary);
router.get('/financial-evolution', DashboardController.getFinancialEvolution);
router.get('/operational-alerts', DashboardController.getOperationalAlerts);

export default router;
