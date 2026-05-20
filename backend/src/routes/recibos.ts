import { Router } from 'express';
import { ReceiptController } from '../controllers/receiptController';

const router = Router();

router.post('/:id/pagar', ReceiptController.pay);
router.get('/:id/pdf', ReceiptController.downloadPDF);
router.get('/contrato/:contratoId', ReceiptController.listByContract);

export default router;
