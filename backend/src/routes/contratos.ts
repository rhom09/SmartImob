import { Router } from 'express';
import { ContractController } from '../controllers/contractController';
import { authMiddleware as authenticate } from '../middleware/auth';

const router = Router();

router.post('/', authenticate, ContractController.create);
router.get('/', authenticate, ContractController.list);
router.get('/:id', authenticate, ContractController.getById);
router.post('/:id/reajustar', authenticate, ContractController.applyAdjustment);

export default router;
