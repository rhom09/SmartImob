import { Router } from 'express';
import { ReceiptController } from '../controllers/receiptController';
import { authMiddleware as authenticate } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, ReceiptController.listAll);
router.post('/', authenticate, ReceiptController.create);
router.post('/preview', authenticate, ReceiptController.preview);
router.post('/:id/pagar', authenticate, ReceiptController.pay);
router.post('/:id/cancelar', authenticate, ReceiptController.cancel);
router.get('/:id/pdf', authenticate, ReceiptController.downloadPDF);
router.get('/contrato/:contratoId', authenticate, ReceiptController.listByContract);

export default router;
