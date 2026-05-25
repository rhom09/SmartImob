import { Router } from 'express';
import { DashboardController } from '../controllers/dashboardController';
import { authMiddleware as authenticate } from '../middleware/auth';

const router = Router();

router.get('/stats', authenticate, DashboardController.getDashboardData);
router.get('/chart-data', authenticate, DashboardController.getChartData);

export default router;
