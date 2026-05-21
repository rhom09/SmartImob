import { Router } from 'express';
import { ExpenseController } from '../controllers/expenseController';

const router = Router();

router.post('/', ExpenseController.create);
router.get('/', ExpenseController.list);
router.get('/:id', ExpenseController.getById);
router.put('/:id', ExpenseController.update);
router.delete('/:id', ExpenseController.delete);
router.post('/:id/pagar', ExpenseController.markAsPaid);

export default router;
