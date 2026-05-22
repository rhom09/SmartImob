import { Router } from 'express';
import { ReceiptController } from '../controllers/receiptController';

const router = Router();

router.get('/', ReceiptController.listAll);
router.post('/', ReceiptController.create);
router.post('/preview', ReceiptController.preview);
router.post('/:id/pagar', ReceiptController.pay);
router.post('/:id/cancelar', ReceiptController.cancel);
router.get('/:id/pdf', ReceiptController.downloadPDF);
router.get('/contrato/:contratoId', ReceiptController.listByContract);

export default router;
