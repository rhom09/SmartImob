import { Router } from 'express';
import { ContractController } from '../controllers/contractController';

const router = Router();

router.post('/', ContractController.create);
router.get('/', ContractController.list);
router.get('/:id', ContractController.getById);
router.post('/:id/reajustar', ContractController.applyAdjustment);

export default router;
