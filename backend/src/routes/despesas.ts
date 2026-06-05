import { Router } from 'express';
import { ExpenseController } from '../controllers/expenseController';
import { authMiddleware as authenticate } from '../middleware/auth';

const router = Router();

router.post('/', authenticate, ExpenseController.create);
router.get('/', authenticate, ExpenseController.list);
router.get('/:id', authenticate, ExpenseController.getById);
router.put('/:id', authenticate, ExpenseController.update);
router.delete('/:id', authenticate, ExpenseController.delete);
router.post('/:id/pagar', authenticate, ExpenseController.markAsPaid);

export default router;
